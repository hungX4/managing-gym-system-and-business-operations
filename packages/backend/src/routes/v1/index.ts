import { Router } from "express";
import authRoute from "./auth.router";
import bookingRoute from './booking.router'
import checkinRouter from "./checkin.router";
import userRouter from "./user.router";
const router = Router();

router.use('/auth', authRoute);
router.use('/booking', bookingRoute);
router.use('/checkin', checkinRouter);
router.use('/user', userRouter);
export default router;