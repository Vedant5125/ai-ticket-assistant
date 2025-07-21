import {inngest} from "../client.js"
import Ticket from "../../models/ticket.model.js"
import { NonRetriableError } from "inngest"
import  {sendmail} from "../../utils/mailer.js"
import User from "../../models/user.model.js"

export const onTicketCreate = inngest.createFunction(
    {id: "on-ticket-create", retries: 2},
    {event: "ticket/created"},
    async({event, step})=>{
        try {
            const {ticketId} = event.data

            //fetch ticket from db
            const ticket = await step.run("fetch-ticket", async() => {
                const ticketObject = await Ticket.findById(ticketId);
                if(!ticketObject){
                    throw new NonRetriableError("Ticket not found");
                }
                return ticketObject;
            })

            await step.run("update-ticket-status", async() => {
                await Ticket.findByIdAndUpdate(ticket._id, {status: "TODO"})
            })

            const aiResponse = await analyzeTicket(ticket);
            console.log("🧠 AI Response:", aiResponse);


            //returning related skills also useful for finding moderator
            const relatedSkills = await step.run("ai-processing", async() => {
                let skills = [];
                if(aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id, {
                        priority: !["low", "medium", "high"].includes(aiResponse.priority) ? "medium" : aiResponse.priority,
                        helpfulNotes: aiResponse.helpfulNotes,
                        status: "IN_PROGRESS",
                        relatedSkills: aiResponse.relatedSkills
                    })
                    skills = aiResponse.relatedSkills
                }
                return skills
            })

            //finding and assigning moderator
            const moderator = await step.run("assign-moderator", async () => {
                let user = await User.findOne(
                    {
                        role: "moderator",
                        skills: {
                            $eleMatch: {
                                $regex: relatedSkills.join("|"),
                                $options: "i"
                            }
                        }
                    }
                )

                if(!user){
                    user = await User.findOne({
                        role: "admin"
                    })
                }

                await Ticket.findByIdAndUpdate(ticket._id, {
                    assignedTo: user?._id || null
                })


            })

            //sending mail to moderator
            await step.run("send-email-notification", async() => {
                if(moderator){
                    const finalTicket = await Ticket.findById(ticket._id)
                    await sendmail(
                        moderator.email, "Ticket assigned",
                        `A new ticket is assigned to you ${finalTicket.title}`
                    )
                }
            })

            return {success: true}
        } catch (error) {
            console.log("Error running step ", error.message);
            return {success: false}
            
        }
    }
)