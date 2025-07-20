import {Inngest} from "inngest"

export const inngest = new Inngest({id: "ticketing-function", eventKey: process.env.INNGEST_EVENT_KEY,})