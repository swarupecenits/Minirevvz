import { Link } from 'react-router-dom';
import FuzzyText from '../components/FuzzyText';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mb-8">
        <FuzzyText
          fontSize="clamp(4rem, 15vw, 10rem)"
          fontWeight={900}
          color="#ffffff"
          baseIntensity={0.15}
          hoverIntensity={0.5}
          enableHover={true}
          clickEffect={true}
          glitchMode={true}
          glitchInterval={3000}
          glitchDuration={150}
          fuzzRange={25}
          direction="horizontal"
          transitionDuration={8}
          className="w-full flex justify-center"
        >
          404
        </FuzzyText>
      </div>

      <p className="text-zinc-400 text-lg md:text-xl text-center mb-8 max-w-md">
        Oops! The page you're looking for seems to have drifted off.
        Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button size="lg" className="h-12 px-8 text-base">
            Back to Home
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline" size="lg" className="h-12 px-8 text-base glass-panel">
            Browse Products
          </Button>
        </Link>
      </div>
    </div>
  );
}