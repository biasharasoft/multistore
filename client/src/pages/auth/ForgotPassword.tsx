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
import { Eye, EyeOff, Loader2, Mail, CheckCircle, RefreshCw, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type OTPForm = z.infer<typeof otpSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { initiatePasswordReset, verifyPasswordResetOTP, completePasswordReset, resendOTP } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      setIsLoading(true);
      setError("");
      
      await initiatePasswordReset(data.email);
      
      setEmail(data.email);
      setStep("verify");
      
      toast({
        title: "Reset code sent",
        description: "Please check your email for the password reset code.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPForm) => {
    try {
      setIsLoading(true);
      setError("");
      
      const result = await verifyPasswordResetOTP(email, data.otp);
      
      setResetToken(result.token);
      setStep("reset");
      
      toast({
        title: "Code verified",
        description: "You can now set your new password.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      setIsLoading(true);
      setError("");
      
      await completePasswordReset(resetToken, data.password, data.confirmPassword);
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now sign in.",
      });
      
      navigate("/auth/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      await resendOTP(email, "reset-password");
      
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
        title: "Code resent",
        description: "A new reset code has been sent to your email.",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthLayout
        title="Enter verification code"
        subtitle="Check your email for the 6-digit reset code"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We sent a password reset code to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
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
              <Label htmlFor="otp">Reset Code</Label>
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
                  Verify Code
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
                onClick={() => setStep("email")}
                data-testid="button-back"
              >
                ← Back to email
              </Button>
            </div>
          </form>
        </div>
      </AuthLayout>
    );
  }

  if (step === "reset") {
    return (
      <AuthLayout
        title="Set new password"
        subtitle="Choose a strong password for your account"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new password for your account
            </p>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6" data-testid="password-form">
            {error && (
              <Alert variant="destructive" data-testid="error-alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  data-testid="input-password"
                  {...passwordForm.register("password")}
                  className={passwordForm.formState.errors.password ? "border-red-500 pr-10" : "pr-10"}
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
              {passwordForm.formState.errors.password && (
                <p className="text-sm text-red-500" data-testid="error-password">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  data-testid="input-confirmPassword"
                  {...passwordForm.register("confirmPassword")}
                  className={passwordForm.formState.errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
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
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500" data-testid="error-confirmPassword">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-reset"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a reset code"
    >
      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6" data-testid="email-form">
        {error && (
          <Alert variant="destructive" data-testid="error-alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            data-testid="input-email"
            {...emailForm.register("email")}
            className={emailForm.formState.errors.email ? "border-red-500" : ""}
          />
          {emailForm.formState.errors.email && (
            <p className="text-sm text-red-500" data-testid="error-email">
              {emailForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          data-testid="button-send"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset code...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send reset code
            </>
          )}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
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