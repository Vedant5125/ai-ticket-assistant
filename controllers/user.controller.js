import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"
import { inngest } from "../Inngest/client.js"

export const signUp = async(req, res) => {
    const {email, password, role: UserRole, skills =[] } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const role = UserRole === "admin" ? "admin" : "user";
        const user = await User.create({email, password: hashedPassword, role, skills})

        await inngest.send({
            name: "user/signUp",
            data: {
                email
            }
        });

        const token = jwt.sign({
                _id : user._id,
                role: user.role,
            }, process.env.JWT_SECRET,
        );

        res.json({user, token})

    } catch (error) {
        res.status(500).json({error: "signup failed", details: error.message});
    }
}

export const login = async(req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error:"User not found"})
        }

        const isMatched= await bcrypt.compare(password, user.password);
        if(!isMatched){
            return res.status(401).json({error: "Invalid credentials"})
        }

        const token = jwt.sign({
                _id : user._id,
                role: user.role,
            }, process.env.JWT_SECRET,
        );

        res.json({user, token});
    } catch (error) {
        res.status(500).json({error: "login failed", details: error.message});
    }
}

export const logout = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({error:"Unauthorized"})
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
            if(err){
                return res.status(401).json({error:"Unauthorized"})
            }
        })
        res.json({message: "logout successfull"})
    } catch (error) {
        res.status(500).json({error: "logout failed", details: error.message});
    }
}

// export const updateUser = async(req, res) =>{
//     const {skills = [], role, email} = req.body;
//     try {
//         if(req.user?.role != "admin"){
//             return res.status(403).json({error: "Forbidden"})
//         }
//         const user = await User.findOne({email});
//         if(!user){
//             return res.status(401).json({error:"User not found"})
//         }

//         await user.updateOne(
//             {email},
//             {skills: skills.length? skills : user.skills, role}
//         )

//         return res.json({message: "User updated successfully"});

//     } catch (error) {
//         res.status(500).json({error: "update failed", details: error.message});
//     }
// }

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  console.log("📩 Incoming update payload:", { email, role, skills });
  try {
    if (req.user?.role !== "admin") {
        console.log("❌ Forbidden: Not an admin");
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        console.log("❌ User not found for email:", email);
      return res.status(401).json({ error: "User not found" });
    }

    user.skills = skills.length ? skills : user.skills;
    user.role = role || user.role;

    console.log("🛠 Updated User Object Before Save:", user);
    await user.save();
    console.log("✅ User updated successfully:", user.email);
    return res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};


export const getUsers = async(req, res) =>{
    try {
        if(req.user.role != "admin"){
            return res.status(403).json({error: "Forbidden"})
        }
        const users = await User.find().select("-password")
        return res.json(users)
    } catch (error) {
        res.status(500).json({error: "getUser failed", details: error.message});
    }
} 