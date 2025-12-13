import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth";
import employeeRoutes from "./routes/employee";
import dtrRoutes from "./routes/dtr";
import payrollRoutes from "./routes/payroll";
import leaveRequests from "./routes/leaveRequests";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/dtr", dtrRoutes);
app.use("/payroll", payrollRoutes);
app.use("/leave-requests", leaveRequests);

app.get("/api", (req, res) => res.send("Payroll API running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
