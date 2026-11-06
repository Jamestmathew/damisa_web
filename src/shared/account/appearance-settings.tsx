import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getAccountAppearance } from "./appearance.service";
import { AppearanceSettingsForm } from "./appearance-form";
export async function AppearanceSettings() {
  const preferences = await getAccountAppearance();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
        <CardDescription>Customize how your portal looks.</CardDescription>
      </CardHeader>
      <CardContent>
        <AppearanceSettingsForm initialValues={preferences} />
      </CardContent>
    </Card>
  );
}
