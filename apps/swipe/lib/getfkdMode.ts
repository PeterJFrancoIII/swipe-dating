export const GETFKD_HIDE_EXIT_KEY = "swipe.getfkd.hideExitPrompt";

export const GETFKD_ENTER_TITLE = "Enter Get Fk'd mode?";
export const GETFKD_ENTER_BODY =
  "You are entering Get Fk'd mode. Your location may be exposed only if both of you match while both are in this mode. Matches and chats from this mode disappear when either of you leaves.";

export const GETFKD_EXIT_TITLE = "Leave Get Fk'd mode?";
export const GETFKD_EXIT_BODY =
  "Every Get Fk'd match and those chats will disappear for both of you. Get each other's numbers first if you want to stay in touch.";

export function shouldPromptGetFkdExit(hidePrompt: boolean): boolean {
  return !hidePrompt;
}
