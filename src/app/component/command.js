export const handleVoiceCommand = (command, router, handleLogout) => {
  const routeCommands = [
    { keyword: "logout", action: handleLogout },
    { keyword: "dashboard", action: () => router.replace("/") },
    { keyword: "login", action: () => router.replace("/login") },
    { keyword: "go to student", action: () => router.replace("/students/all-module") },
    { keyword: "go to master entry", action: () => router.replace("/master-entry/all-module") },
    { keyword: "go to transport", action: () => router.replace("/Transport/all-module") },
    { keyword: "go to fees", action: () => router.replace("/fees/all-module") },
    { keyword: "go to medical", action: () => router.replace("/medical/all-module") },
    { keyword: "go to stock", action: () => router.replace("/stock/all-module") },
    { keyword: "go to notice", action: () => router.replace("/notice/all-module") },
    { keyword: "go to home", action: () => router.replace("/home") },
    { keyword: "go to advertising management", action: () => router.replace("/advertising-management/all-module") },
    { keyword: "go to appointment", action: () => router.replace("/appointment") },
    { keyword: "go to dailydairy", action: () => router.replace("/dailyDairy") },
    { keyword: "go to exam", action: () => router.replace("/exam/all-module") },
    { keyword: "go to front office", action: () => router.replace("/front-office/all-module") },
    { keyword: "go to gallery", action: () => router.replace("/gallery/all-module") },
    { keyword: "go to hrd", action: () => router.replace("/hrd/allModule") },
    { keyword: "go to important SMS", action: () => router.replace("/importantSMS") },
    { keyword: "go to library", action: () => router.replace("/library/all-module") },
    { keyword: "go to student attendance", action: () => router.replace("/studentAttendence/allModule") },
    { keyword: "go to thought", action: () => router.replace("/thought") },
    { keyword: "go to user management", action: () => router.replace("/userManagement/all-module") },
    { keyword: "go to accounts", action: () => router.replace("/accounts/all-module") },
  ];

  for (const cmd of routeCommands) {
    if (command.includes(cmd.keyword)) {
      cmd.action();
      break;
    }
  }
};
