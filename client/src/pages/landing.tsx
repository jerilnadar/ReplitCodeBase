import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Calendar, Users, CheckCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Music className="text-primary text-2xl" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ministry Scheduler</h1>
                <p className="text-sm text-gray-500">Music Ministry Coordination</p>
              </div>
            </div>
            <Button onClick={handleLogin} data-testid="button-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Streamline Your Music Ministry Scheduling
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Coordinate your church music ministry with ease. Submit availability, view schedules, 
            and get pastor approval all in one place.
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Easy Scheduling</CardTitle>
              <CardDescription>
                Submit your monthly availability with a simple calendar interface
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
              <CardTitle>Team Coordination</CardTitle>
              <CardDescription>
                See who's available and coordinate across all ministry roles
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle>Pastor Approval</CardTitle>
              <CardDescription>
                Streamlined approval workflow ensures organized services
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Ministry Roles */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Ministry Roles</CardTitle>
            <CardDescription className="text-center">
              We support all the roles in your music ministry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Singers</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Guitarist</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Bassist</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Keyboard</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Drums</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">PA/Sound</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Melody</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join your music ministry team and start coordinating schedules today.
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="button-join-now">
            Join Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Music className="text-primary" />
              <span className="text-gray-600">Ministry Scheduler</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-sm">Serving with excellence</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>© 2025 Ministry Scheduler</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
