export const GETFKD_HIDE_EXIT_KEY = "swipe.getfkd.hideExitPrompt";

export const GETFKD_ENTER_TITLE = "Enter Get Fk'd mode?";
export const GETFKD_ENTER_BODY =
  "Optional. Ordinary swipe, photos, chat, and meetup work with this off. Leave it off unless you want nearby cues. You are entering Get Fk'd mode. Discovery starts within 1 mile. Your location may be exposed only if both of you match while both are in this mode. Bluetooth is requested only after you confirm. If another adult also has the mode on and is within Bluetooth range, your phone will sonar-ding and vibrate more warmly the closer you get while this app is open. There are no lock-screen or background cues. The Bluetooth radio does not carry your name, photos, or profile. No exact distance or direction is shown. Matches and chats from this mode disappear when either of you leaves.";

export const GETFKD_EXIT_TITLE = "Leave Get Fk'd mode?";
export const GETFKD_EXIT_BODY =
  "Every Get Fk'd match and those chats will disappear for both of you. Get each other's numbers first if you want to stay in touch.";

export function shouldPromptGetFkdExit(hidePrompt: boolean): boolean {
  return !hidePrompt;
}
