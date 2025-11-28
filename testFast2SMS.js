import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const phone = "8297159220"; // replace with your number
const otp = "123456";

async function testFast2SMS() {
  try {
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
      },
      params: {
    

        route : "q",
message : "hi",
numbers : 6262156969,
flash : "0"
      },
    });
    console.log("Fast2SMS Test Response:", response.data);
  } catch (err) {
    console.error("Fast2SMS Test Error:", err.response?.data || err.message);
  }
}

testFast2SMS();
