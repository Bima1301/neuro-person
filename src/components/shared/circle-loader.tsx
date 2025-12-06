interface CircleLoaderProps {
  size?: number;
  pathColor?: string;
  dotColor?: string;
  duration?: number;
  baseColor?: "default" | "white";
}

export default function CircleLoader({
  size = 44,
  pathColor,
  dotColor,
  duration = 3,
  baseColor = "default",
}: CircleLoaderProps) {
  // Set colors based on baseColor prop
  const finalPathColor =
    pathColor || (baseColor === "white" ? "#FFFFFF" : "#2F3545");
  const finalDotColor =
    dotColor || (baseColor === "white" ? "#FFFFFF" : "#5628EE");
  return (
    <>
      <style>{`
        @keyframes pathCircle {
          25% {
            stroke-dashoffset: 125;
          }
          50% {
            stroke-dashoffset: 175;
          }
          75% {
            stroke-dashoffset: 225;
          }
          100% {
            stroke-dashoffset: 275;
          }
        }

        .circle-loader {
          width: ${size}px;
          height: ${size}px;
          position: relative;
          display: inline-block;
        }

        .circle-loader::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          position: absolute;
          display: block;
          background: ${finalDotColor};
          top: 37px;
          left: 19px;
          transform: translate(-18px, -18px);
          animation: dotCircle ${duration}s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }

        .circle-loader svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .circle-loader circle {
          fill: none;
          stroke: ${finalPathColor};
          stroke-width: 10px;
          stroke-linejoin: round;
          stroke-linecap: round;
          stroke-dasharray: 150 50 150 50;
          stroke-dashoffset: 75;
          animation: pathCircle ${duration}s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
        }

        @keyframes dotCircle {
          25% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(18px, -18px);
          }
          75% {
            transform: translate(0, -36px);
          }
          100% {
            transform: translate(-18px, -18px);
          }
        }
      `}</style>

      <div className="circle-loader">
        <svg viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32"></circle>
        </svg>
      </div>
    </>
  );
}
