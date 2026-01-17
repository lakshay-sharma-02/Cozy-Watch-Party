import { Button } from '@/components/ui/button';
import { Video, Gamepad2, Monitor, Heart, Sparkles, Play, Zap } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(var(--chart-1)/0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--chart-2)/0.1),transparent_50%)]" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float opacity-60" />
      <div className="absolute bottom-40 right-[15%] w-96 h-96 bg-chart-1/15 rounded-full blur-3xl animate-float-slow opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      
      {/* Floating icons */}
      <div className="absolute top-32 right-[20%] animate-float opacity-20">
        <Video className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute bottom-32 left-[15%] animate-float-slow opacity-20">
        <Gamepad2 className="w-20 h-20 text-chart-1" />
      </div>
      <div className="absolute top-1/2 right-[10%] animate-bounce-gentle opacity-15">
        <Heart className="w-12 h-12 text-destructive" />
      </div>
      
      <div className="relative container px-4 py-20 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Animated badge */}
          <div className="opacity-0 animate-fade-in inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass gradient-border hover-glow cursor-default group">
            <Heart className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              Made for couples & friends
            </span>
            <Sparkles className="w-4 h-4 text-chart-1 animate-pulse" />
          </div>

          {/* Main heading with gradient */}
          <h1 className="opacity-0 animate-fade-in-up stagger-1 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
            Watch movies{' '}
            <span className="relative">
              <span className="gradient-text">together</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 150 4 298 10" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop stopColor="hsl(var(--primary))" />
                    <stop offset="1" stopColor="hsl(var(--chart-1))" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            <span className="text-muted-foreground">from anywhere</span>
          </h1>

          {/* Subheading */}
          <p className="opacity-0 animate-fade-in-up stagger-2 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The ultimate watch party experience. Video chat, synchronized playback, 
            and fun games — all in one place. Perfect for 
            <span className="text-foreground font-medium"> date nights</span> and 
            <span className="text-foreground font-medium"> friend hangouts</span>.
          </p>

          {/* CTA buttons */}
          <div className="opacity-0 animate-fade-in-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              onClick={onGetStarted} 
              className="text-lg px-10 py-7 rounded-2xl animate-pulse-glow hover:scale-105 transition-transform group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Watch Party
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 rounded-2xl glass hover-lift group"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="opacity-0 animate-fade-in-up stagger-4 flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">100%</div>
              <div className="text-sm text-muted-foreground">Free to Use</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">2+</div>
              <div className="text-sm text-muted-foreground">Friends Together</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">∞</div>
              <div className="text-sm text-muted-foreground">Movies to Watch</div>
            </div>
          </div>

          {/* Features grid */}
          <div className="opacity-0 animate-fade-in-up stagger-5 grid md:grid-cols-3 gap-6 pt-20">
            <div className="group p-8 rounded-3xl glass hover-lift hover-glow cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Video Chat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Face-to-face reactions while watching. See each other laugh, cry, and enjoy together in real-time.
              </p>
            </div>

            <div className="group p-8 rounded-3xl glass hover-lift hover-glow cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chart-1/20 to-chart-1/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Screen Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Share any movie from your browser with crystal clear quality. Perfect sync with audio included.
              </p>
            </div>

            <div className="group p-8 rounded-3xl glass hover-lift hover-glow cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Play UNO</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built-in UNO game for commercial breaks or just for fun during your watch party.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
