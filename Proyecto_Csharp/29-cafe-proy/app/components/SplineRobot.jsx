import Spline from '@splinetool/react-spline';

export default function SplineRobot() {
  return (
    <div className="spline-container">
      <Spline 
        scene="https://prod.spline.design/Ty9GcVmEKCjvOACd/scene.splinecode"
        className="w-full h-full"
      />
    </div>
  );
}