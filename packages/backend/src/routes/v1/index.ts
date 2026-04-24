import { Router } from "express";
import authRoute from "./auth.route";
import bookingRoute from './booking.route'
import checkinRouter from "./checkin.route";
import userRouter from "./user.route";
import packageRouter from "./package.route";
import memberSubscriptionRoute from "./member-subscription.routes";
import salaryConfigRoute from "./salary-config.routes";
import salaryRoute from "./salary.route";
import trialRouter from "./trialLead.route";
const router = Router();

router.use('/auth', authRoute);
router.use('/booking', bookingRoute);
router.use('/checkin', checkinRouter);
router.use('/user', userRouter);
router.use('/package', packageRouter);
router.use('/subscription', memberSubscriptionRoute);
router.use('/salaryconfig', salaryConfigRoute);
router.use('/salary', salaryRoute);
router.use('/trial', trialRouter);
export default router;