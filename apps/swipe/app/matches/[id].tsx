import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AuthPhoto } from "@/components/AuthPhoto";
import { ProfileSheet } from "@/components/DatingCard";
import { ActionBang, SurfaceBang } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import { Screen, Toast } from "@/components/Screen";
import { alignmentLabel } from "@/lib/alignment";
import { ApiError, api } from "@/lib/api";
import { displayDistance } from "@/lib/distance";
import { useLiveChat } from "@/lib/chatLive";
import { formatRemaining, isExpired, statusLabel } from "@/lib/matchTime";
import type { ChatState } from "@/lib/types";
import { theme } from "@/lib/theme";

function TypingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((value) => (value + 1) % 3), 380);
    return () => clearInterval(timer);
  }, []);
  return (
    <Text style={styles.typingDots}>
      {["·  ", "·· ", "···"][frame]}
    </Text>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = decodeURIComponent(id ?? "");
  const [chat, setChat] = useState<ChatState | null>(null);
  const [text, setText] = useState("");
  const [flash, setFlash] = useState<{ error?: string | null; notice?: string | null }>({});
  const [menu, setMenu] = useState(false);
  const [meetup, setMeetup] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [reason, setReason] = useState("scam");
  const [note, setNote] = useState("");

  const [peerTyping, setPeerTyping] = useState(false);
  const typingHold = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const next = await api.chat(matchId);
    setChat(next);
  }, [matchId]);

  useEffect(() => {
    void load().catch((cause) => {
      setFlash({ error: cause instanceof ApiError ? cause.message : "Chat failed." });
    });
  }, [load]);

  const { sendTyping } = useLiveChat(matchId, Boolean(chat) && !isExpired(chat?.match.status), {
    onTyping() {
      setPeerTyping(true);
      if (typingHold.current) {
        clearTimeout(typingHold.current);
      }
      typingHold.current = setTimeout(() => setPeerTyping(false), 2500);
    },
    onMessage(event) {
      setPeerTyping(false);
      setChat((current) => {
        if (!current || !event.message?.body) {
          return current;
        }
        const incoming = {
          id: event.message.id,
          body: event.message.body,
          mine: Boolean(current.viewer_id) && event.message.sender_id === current.viewer_id,
          sender:
            current.viewer_id && event.message.sender_id === current.viewer_id
              ? "You"
              : current.match.display_name,
        };
        if (incoming.id && current.messages.some((item) => item.id === incoming.id)) {
          return current;
        }
        return {
          ...current,
          match: {
            ...current.match,
            ...event.match,
            message_count: event.match?.message_count ?? current.match.message_count + 1,
          },
          messages: [...current.messages, incoming],
        };
      });
    },
    onClosed() {
      router.replace("/matches");
    },
    onReconnect() {
      void load().catch(() => undefined);
    },
  });

  async function run(action: () => Promise<ChatState | { matches: unknown[] }>) {
    try {
      const next = await action();
      if ("match" in next) {
        setChat(next);
        setFlash({ notice: next.notice });
      } else {
        router.replace("/matches");
      }
    } catch (cause) {
      setFlash({ error: cause instanceof ApiError ? cause.message : "Action failed." });
    }
  }

  if (!chat) {
    return (
      <Screen>
        <Toast error={flash.error} />
      </Screen>
    );
  }

  const person = chat.match;
  const expired = isExpired(person.status);
  const atLimit = person.message_count >= person.message_limit;

  return (
    <Screen footer={false}>
      <View style={styles.topbar}>
        <ActionBang href={surfaceHref("chat", "back")} label="Back to Matches">
          <Pressable accessibilityLabel="Back to Matches" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backMark}>‹</Text>
          </Pressable>
        </ActionBang>
        <ActionBang href={surfaceHref("chat", "profile")} label="Match profile">
        <Pressable onPress={() => setSheet(true)} style={styles.person}>
          <AuthPhoto fallback={person.display_name[0]} path={person.photo_url} style={styles.tiny} />
          <View>
            <Text style={styles.personName}>{person.display_name}</Text>
            <Text style={styles.personMeta}>
              {person.age_band} · {displayDistance(person.distance_label || person.region_label)}
              {person.status ? ` · ${statusLabel(person.status)}` : ""}
            </Text>
          </View>
        </Pressable>
        </ActionBang>
        <SurfaceBang href={surfaceHref("chat")} label="Chat" />
        <ActionBang href={surfaceHref("chat", "menu")} label="Conversation options">
          <Pressable accessibilityLabel="Conversation options" onPress={() => setMenu((open) => !open)} style={styles.icon}>
            <Text>•••</Text>
          </Pressable>
        </ActionBang>
      </View>
      <Toast error={flash.error} notice={flash.notice} />
      {person.getfkd ? (
        <Text style={styles.getfkdBanner}>
          Get Fk'd match. This chat disappears when either of you leaves the mode. Get a number first.
        </Text>
      ) : null}
      {menu ? (
        <View style={styles.menu}>
          <Text style={styles.menuTitle}>Conversation options</Text>
          <ActionBang href={surfaceHref("chat", "unmatch")} label="Unmatch">
            <Pressable onPress={() => void run(() => api.unmatch(matchId))}>
              <Text style={styles.menuAction}>Unmatch</Text>
            </Pressable>
          </ActionBang>
          <ActionBang href={surfaceHref("chat", "block")} label="Block">
            <Pressable onPress={() => void run(() => api.block(matchId))}>
              <Text style={[styles.menuAction, styles.dangerText]}>Block</Text>
            </Pressable>
          </ActionBang>
          {chat.report_options.map((option) => (
            <Pressable key={option.id} onPress={() => setReason(option.id)}>
              <Text style={styles.reason}>
                {reason === option.id ? "● " : "○ "}
                {option.label}
              </Text>
            </Pressable>
          ))}
          <TextInput onChangeText={setNote} placeholder="Optional note" style={styles.note} value={note} />
          <ActionBang href={surfaceHref("chat", "report")} label="Report match">
            <Pressable onPress={() => void run(() => api.reportMatch(matchId, reason, note))}>
              <Text style={[styles.menuAction, styles.dangerText]}>Report</Text>
            </Pressable>
          </ActionBang>
          <ActionBang href={surfaceHref("chat", "report-block")} label="Report and block">
            <Pressable onPress={() => void run(() => api.reportMatch(matchId, reason, note, true))}>
              <Text style={[styles.menuAction, styles.dangerText]}>Report & Block</Text>
            </Pressable>
          </ActionBang>
        </View>
      ) : null}
      <View style={styles.context}>
        <Text style={[styles.align, expired || person.urgency === "critical" ? styles.alignHot : null]}>
          {expired
            ? "EXPIRED"
            : [formatRemaining(person.remaining_ms), alignmentLabel(person)].filter(Boolean).join(" · ") ||
              "You matched"}
        </Text>
        <Text style={styles.contextCopy}>
          {expired
            ? "This match closed. Messaging is off. A limited splash stays so you can see it ended."
            : "You matched. There is no required opener—start wherever feels natural."}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.thread}>
        {chat.messages.length ? (
          chat.messages.map((message, index) => (
            <View key={message.id ?? `${index}-${message.body}`} style={[styles.message, message.mine ? styles.mine : styles.theirs]}>
              <Text style={[styles.bubble, message.mine ? styles.mineBubble : styles.theirsBubble]}>{message.body}</Text>
              <Text style={styles.sender}>{message.sender}</Text>
            </View>
          ))
        ) : peerTyping ? null : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>You matched with {person.display_name}</Text>
            <Text style={styles.emptyCopy}>No automatic message was sent.</Text>
          </View>
        )}
        {peerTyping ? (
          <View style={[styles.message, styles.theirs]}>
            <View style={[styles.bubble, styles.theirsBubble, styles.typingBubble]}>
              <Text style={styles.typingLabel}>Typing</Text>
              <TypingDots />
            </View>
          </View>
        ) : null}
      </ScrollView>
      {expired ? null : (
      <View style={styles.meetupBar}>
        <ActionBang href={surfaceHref("chat", "meetup")} label="Plan a meetup">
          <Pressable onPress={() => setMeetup((open) => !open)} style={styles.meetupButton}>
            <Text style={styles.meetupLabel}>Plan a meetup</Text>
          </Pressable>
        </ActionBang>
        <Text style={styles.counter}>
          {person.message_count} / {person.message_limit}
        </Text>
      </View>
      )}
      {meetup ? (
        <View style={styles.meetupSheet}>
          <Text style={styles.eyebrow}>MEET OFFLINE</Text>
          <Text style={styles.meetupTitle}>Keep the first plan simple.</Text>
          <Text style={styles.meetupHelp}>No location is shared by choosing an idea.</Text>
          {chat.meetup_suggestions.map((item) => (
            <ActionBang key={item.id} href={surfaceHref("chat", "meetup", item.id)} label={item.title}>
              <Pressable onPress={() => void run(() => api.meetup(matchId, item.id))} style={styles.meetupOption}>
                <Text style={styles.meetupOptionTitle}>{item.title}</Text>
                <Text style={styles.meetupHelp}>Send as a proposal</Text>
              </Pressable>
            </ActionBang>
          ))}
        </View>
      ) : null}
      {expired ? (
        <View style={styles.limit}>
          <Text style={styles.limitTitle}>EXPIRED</Text>
          <Text style={styles.meetupHelp}>You can unmatch this splash or leave it. Reliability is not changed by unmatch or block.</Text>
        </View>
      ) : atLimit ? (
        <View style={styles.limit}>
          <Text style={styles.limitTitle}>You reached the {person.message_limit}-message limit.</Text>
          <Text style={styles.meetupHelp}>Plan a meetup, use the one-time mutual extension, or end the match.</Text>
          {!person.extension_used ? (
            <ActionBang href={surfaceHref("chat", "extend")} label="Extend this chat once">
              <Pressable onPress={() => void run(() => api.extend(matchId))} style={styles.secondary}>
                <Text>Extend this chat once</Text>
              </Pressable>
            </ActionBang>
          ) : null}
        </View>
      ) : (
        <View style={styles.composer}>
          <TextInput
            onChangeText={(value) => {
              setText(value);
              if (value.trim()) {
                sendTyping();
              }
            }}
            placeholder={`Message ${person.display_name}`}
            placeholderTextColor={theme.mute}
            style={styles.input}
            value={text}
          />
          <ActionBang href={surfaceHref("chat", "send")} label="Send message">
            <Pressable
              accessibilityLabel="Send message"
              onPress={() => {
                const body = text.trim();
                if (!body) {
                  return;
                }
                setText("");
                void run(() => api.message(matchId, body));
              }}
              style={styles.send}
            >
              <Text style={styles.sendMark}>↑</Text>
            </Pressable>
          </ActionBang>
        </View>
      )}
      <ProfileSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        name={person.display_name}
        age={person.age_band}
        genders={person.genders}
        looking={person.looking}
        about={person.about}
        interests={person.interests}
        turnOns={person.turn_ons}
        boosted={person.boosted}
        alignment={alignmentLabel(person)}
        distance={displayDistance(person.distance_label || person.region_label)}
        photos={[]}
        photoIndex={0}
        onPhoto={() => undefined}
        synthetic={person.synthetic}
        testing_banner={person.testing_banner}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
  },
  getfkdBanner: {
    backgroundColor: "#FFE4EE",
    borderColor: theme.line,
    borderRadius: 12,
    borderWidth: 1,
    color: theme.roseDeep,
    fontSize: 13,
    fontWeight: "700",
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  back: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  backMark: {
    fontSize: 30,
    lineHeight: 30,
  },
  person: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  tiny: {
    alignItems: "center",
    backgroundColor: "#4c3f52",
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    overflow: "hidden",
    width: 38,
  },
  tinyMark: {
    color: "#fff",
    fontWeight: "900",
  },
  personName: {
    color: theme.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  personMeta: {
    color: theme.navIdle,
    fontSize: 9,
  },
  icon: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  menu: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  menuAction: {
    color: theme.ink,
    paddingVertical: 12,
  },
  dangerText: {
    color: "#C41E4A",
  },
  reason: {
    color: theme.mute,
    paddingVertical: 4,
  },
  note: {
    borderColor: theme.line,
    borderRadius: 13,
    borderWidth: 1,
    padding: 12,
  },
  context: {
    alignItems: "center",
    paddingVertical: 12,
  },
  align: {
    backgroundColor: "#fff",
    borderRadius: 999,
    color: "#16161a",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  alignHot: {
    backgroundColor: theme.errorBg,
    color: theme.roseDeep,
  },
  contextCopy: {
    color: theme.mute,
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  thread: {
    flexGrow: 1,
    gap: 8,
    justifyContent: "flex-end",
    minHeight: 220,
    paddingVertical: 12,
  },
  message: {
    maxWidth: "78%",
  },
  mine: {
    alignSelf: "flex-end",
  },
  theirs: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 20,
    overflow: "hidden",
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  mineBubble: {
    backgroundColor: "#ff4a76",
    color: "#fff",
  },
  theirsBubble: {
    backgroundColor: "#FFE4EE",
    color: theme.ink,
  },
  typingBubble: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    minWidth: 86,
  },
  typingLabel: {
    color: theme.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  typingDots: {
    color: theme.mute,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  sender: {
    color: theme.navIdle,
    fontSize: 9,
    paddingHorizontal: 4,
  },
  empty: {
    alignItems: "center",
  },
  emptyTitle: {
    color: theme.ink,
    fontWeight: "800",
  },
  emptyCopy: {
    color: theme.mute,
    fontSize: 11,
  },
  meetupBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  meetupButton: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  meetupLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  counter: {
    color: theme.mute,
    fontSize: 10,
  },
  meetupSheet: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 17,
  },
  eyebrow: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  meetupTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  meetupHelp: {
    color: theme.mute,
    fontSize: 11,
  },
  meetupOption: {
    borderColor: theme.line,
    borderRadius: 13,
    borderWidth: 1,
    padding: 12,
  },
  meetupOptionTitle: {
    color: theme.ink,
    fontWeight: "800",
  },
  limit: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  limitTitle: {
    fontWeight: "800",
  },
  secondary: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  composer: {
    alignItems: "flex-end",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },
  input: {
    color: theme.ink,
    flex: 1,
    fontSize: 14,
    minHeight: 34,
    padding: 8,
  },
  send: {
    alignItems: "center",
    backgroundColor: "#ff4b76",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  sendMark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
});
