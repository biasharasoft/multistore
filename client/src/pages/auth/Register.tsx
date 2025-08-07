import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type OTPForm = z.infer<typeof otpSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { initiateRegistration, completeRegistration, resendOTP } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [registrationData, setRegistrationData] = useState<RegisterForm | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError("");
      
      await initiateRegistration(data.email, data.firstName, data.lastName, data.password, data.confirmPassword);
      
      setRegistrationData(data);
      setStep("verify");
      
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPForm) => {
    if (!registrationData) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      await completeRegistration(
        registrationData.email,
        data.otp,
        registrationData.firstName,
        registrationData.lastName,
        registrationData.password
      );
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created and verified.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData || resendCooldown > 0) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      await resendOTP(registrationData.email, "register");
      
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="Enter the 6-digit code sent to your email address"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We sent a verification code to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {registrationData?.email}
              </span>
            </p>
          </div>

          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6" data-testid="otp-form">
            {error && (
              <Alert variant="destructive" data-testid="error-alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                data-testid="input-otp"
                {...otpForm.register("otp")}
                className={`text-center text-lg tracking-widest ${otpForm.formState.errors.otp ? "border-red-500" : ""}`}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-sm text-red-500" data-testid="error-otp">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-verify"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isLoading}
                data-testid="button-resend"
              >
                {resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("register")}
                data-testid="button-back"
              >
                ← Back to registration
              </Button>
            </div>
          </form>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and start managing your retail business"
    >
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6" data-testid="register-form">
        {error && (
          <Alert variant="destructive" data-testid="error-alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              data-testid="input-firstName"
              {...registerForm.register("firstName")}
              className={registerForm.formState.errors.firstName ? "border-red-500" : ""}
            />
            {registerForm.formState.errors.firstName && (
              <p className="text-sm text-red-500" data-testid="error-firstName">
                {registerForm.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              data-testid="input-lastName"
              {...registerForm.register("lastName")}
              className={registerForm.formState.errors.lastName ? "border-red-500" : ""}
            />
            {registerForm.formState.errors.lastName && (
              <p className="text-sm text-red-500" data-testid="error-lastName">
                {registerForm.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            data-testid="input-email"
            {...registerForm.register("email")}
            className={registerForm.formState.errors.email ? "border-red-500" : ""}
          />
          {registerForm.formState.errors.email && (
            <p className="text-sm text-red-500" data-testid="error-email">
              {registerForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              data-testid="input-password"
              {...registerForm.register("password")}
              className={registerForm.formState.errors.password ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              data-testid="toggle-password"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {registerForm.formState.errors.password && (
            <p className="text-sm text-red-500" data-testid="error-password">
              {registerForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              data-testid="input-confirmPassword"
              {...registerForm.register("confirmPassword")}
              className={registerForm.formState.errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              data-testid="toggle-confirmPassword"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {registerForm.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500" data-testid="error-confirmPassword">
              {registerForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          data-testid="button-register"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              data-testid="link-login"
            >
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}