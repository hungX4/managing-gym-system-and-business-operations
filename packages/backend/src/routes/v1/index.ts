import { Router } from "express";
import authRoute from "./auth.router";
import bookingRoute from './booking.router'
import checkinRouter from "./checkin.router";
import userRouter from "./user.router";
import packageRouter from "./package.router";
import memberSubscriptionRoute from "./member-subscription.routes";
import salaryConfigRoute from "./salary-config.routes";
const router = Router();

router.use('/auth', authRoute);
router.use('/booking', bookingRoute);
router.use('/checkin', checkinRouter);
router.use('/user', userRouter);
router.use('/package', packageRouter);
router.use('/subscription', memberSubscriptionRoute);
router.use('/salaryconfig', salaryConfigRoute);
export default router;