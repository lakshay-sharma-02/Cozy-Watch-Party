import { Button } from '@/components/ui/button';
import { Video, Gamepad2, Monitor, Heart } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-1/5" />
      
      {/* Animated shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-1/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative container px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Made for couples & friends</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Watch movies{' '}
            <span className="text-primary">together</span>
            <br />
            from anywhere
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The ultimate watch party experience. Video chat, synchronized playback, 
            and fun games — all in one place. Perfect for date nights and friend hangouts.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-6">
              <Video className="w-5 h-5 mr-2" />
              Start Watch Party
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Chat</h3>
              <p className="text-muted-foreground text-sm">
                Face-to-face reactions while watching. See each other laugh, cry, and enjoy together.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center mb-4 mx-auto">
                <Monitor className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Screen Sharing</h3>
              <p className="text-muted-foreground text-sm">
                Share any movie from your browser. Perfect sync with audio included.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center mb-4 mx-auto">
                <Gamepad2 className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Play UNO</h3>
              <p className="text-muted-foreground text-sm">
                Built-in UNO game for commercial breaks or just for fun during your watch party.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
