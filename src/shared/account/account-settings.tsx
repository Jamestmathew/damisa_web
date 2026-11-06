import { AccountNameForm } from "./account-name-form";
import { ProfilePictureForm } from "./profile-picture-form";
import { ChangePasswordForm } from "@/modules/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export function AccountSettings({ showName = true }: { showName?: boolean }) {
  return (
    <>
      <ProfilePictureForm />
      {showName && <AccountNameForm />}
      <Card id="password">
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>
            Update the password used to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </>
  );
}
