export const handleVoiceCommand = (command, router, handleLogout) => {
  const normalizedCommand = command.toLowerCase();

  const routeCommands = [
    { keywords: ["logout", "exit site"], action: handleLogout },
    { keywords: ["dashboard", "home screen"], action: () => router.replace("/") },
    // { keywords: ["login", "log in"], action: () => router.replace("/login") },
    { keywords: ["student", "student module"], action: () => router.replace("/students/all-module") },
    { keywords: ["master","master entry"], action: () => router.replace("/master-entry/all-module") },
    { keywords: ["transport"], action: () => router.replace("/Transport/all-module") },
    { keywords: ["fees", "fees module"], action: () => router.replace("/fees/all-module") },
    { keywords: ["medical"], action: () => router.replace("/medical/all-module") },
    { keywords: ["stock"], action: () => router.replace("/stock/all-module") },
    { keywords: ["notice"], action: () => router.replace("/notice/all-module") },
    { keywords: ["home"], action: () => router.replace("/home") },
    { keywords: ["advertising", "advertising management"], action: () => router.replace("/advertising-management/all-module") },
    { keywords: ["appointment"], action: () => router.replace("/appointment") },
    { keywords: ["dailydairy", "daily dairy"], action: () => router.replace("/dailyDairy") },
    { keywords: ["exam"], action: () => router.replace("/exam/all-module") },
    { keywords: ["front office"], action: () => router.replace("/front-office/all-module") },
    { keywords: ["gallery"], action: () => router.replace("/gallery/all-module") },
    { keywords: ["hrd"], action: () => router.replace("/hrd/allModule") },
    { keywords: ["important sms"], action: () => router.replace("/importantSMS") },
    { keywords: ["library"], action: () => router.replace("/library/all-module") },
    { keywords: ["student attendance"], action: () => router.replace("/studentAttendence/allModule") },
    { keywords: ["thought"], action: () => router.replace("/thought") },
    { keywords: ["user management"], action: () => router.replace("/userManagement/all-module") },
    { keywords: ["accounts"], action: () => router.replace("/accounts/all-module") },
  ];

  for (const cmd of routeCommands) {
    for (const keyword of cmd.keywords) {
      if (normalizedCommand.includes(keyword)) {
        cmd.action();
        return;  // Found match, exit loop
      }
    }
  }
};
