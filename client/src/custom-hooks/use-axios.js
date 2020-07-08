import axios from "axios";

const headers = {
  headers: {
    "x-auth-token":
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxfSwiaWF0IjoxNTY2ODMzMDIyLCJleHAiOjE1NzA0MzMwMjJ9.zR8GlkvC1N7uxcz5W3PqnD9X59A2WARJMSuOASOEs3E",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
};

const baserUrl = "http://localhost:5000/"; //"http://localhost:5000/"; //"http://18.217.104.6/";

const Axios = (url, formdata, reqType) => {
  if (reqType === "post") {
    return axios.post(`${baserUrl}${url}`, formdata, headers);
  }
};

export default Axios;
