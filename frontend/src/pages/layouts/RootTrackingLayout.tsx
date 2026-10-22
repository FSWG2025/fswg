import { Outlet } from "react-router";
import VisitorTracker from "@/components/tracking/VisitorTracker";

/** App-wide shell so visitor tracking covers public + auth + private routes. */
const RootTrackingLayout = () => {
  return (
    <>
      <VisitorTracker />
      <Outlet />
    </>
  );
};

export default RootTrackingLayout;
