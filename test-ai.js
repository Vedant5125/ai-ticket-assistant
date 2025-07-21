import analyzeTicket from "./utils/ai.js";

analyzeTicket({
  title: "Login button not working",
  description: "The user is unable to log in on Chrome browser."
}).then((res) => {
  console.log("🧠 AI Response:", res);
});
