import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ReportFab } from "@/components/ReportBugButton";
import { alignmentLabel } from "@/lib/alignment";
import { mediaHeaders } from "@/lib/api";
import { displayDistance } from "@/lib/distance";
import { resolvedMediaUri } from "@/lib/hotDeck";
import { testingBanner } from "@/lib/testingCard";
import { theme } from "@/lib/theme";
import type { Candidate } from "@/lib/types";

export function DatingCard({
  candidate,
  photoIndex,
  onPhoto,
  onOpen,
  footerHeight = 0,
}: {
  candidate: Candidate;
  photoIndex: number;
  onPhoto: (index: number) => void;
  onOpen?: () => void;
  footerHeight?: number;
}) {
  const photo = candidate.photos[photoIndex] ?? candidate.photo_url;
  const score = alignmentLabel(candidate);
  const fake = testingBanner(candidate);
  return (
    <View style={styles.card}>
      <View style={styles.surface}>
        {fake ? (
          <Text accessibilityRole="text" style={styles.fakeBanner}>
            {fake}
          </Text>
        ) : null}
        {photo ? (
          <Image
            resizeMode="cover"
            source={{ uri: resolvedMediaUri(photo), headers: mediaHeaders() }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.monogramWrap}>
            <Text style={styles.monogram}>{candidate.display_name[0]}</Text>
          </View>
        )}
        {candidate.photo_count > 1 ? (
          <>
            <Pressable
              accessibilityLabel="Previous photo"
              onPress={() => onPhoto((photoIndex - 1 + candidate.photo_count) % candidate.photo_count)}
              style={[styles.nav, styles.prev]}
            >
              <Text style={styles.navMark}>‹</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Next photo"
              onPress={() => onPhoto((photoIndex + 1) % candidate.photo_count)}
              style={[styles.nav, styles.next]}
            >
              <Text style={styles.navMark}>›</Text>
            </Pressable>
            <Text style={[styles.count, fake ? styles.countBelowBanner : null]}>
              {photoIndex + 1} / {candidate.photo_count}
            </Text>
          </>
        ) : null}
        <View style={styles.gradient} />
        <View style={[styles.overlay, footerHeight ? { paddingBottom: 24 + footerHeight } : null]}>
          <View style={styles.badges}>
            {candidate.boosted ? <Text style={styles.boost}>Boost</Text> : null}
            {score ? <Text style={styles.align}>{score}</Text> : null}
            <Text style={styles.distance}>{displayDistance(candidate.distance_label || candidate.region_label)}</Text>
          </View>
          <Text style={styles.name}>
            {candidate.display_name} <Text style={styles.age}>{candidate.age_band}</Text>
          </Text>
          <Text style={styles.looking}>{candidate.looking}</Text>
          <Text style={styles.habits}>{candidate.habits}</Text>
          <Text style={styles.bio} numberOfLines={2}>
            {candidate.about}
          </Text>
          <View style={styles.traits}>
            {candidate.interests.map((tag) => (
              <Text key={tag.id} style={styles.trait}>
                {tag.icon} {tag.label}
              </Text>
            ))}
          </View>
          <Text style={styles.more}>Tap for more</Text>
        </View>
        <Pressable
          accessibilityLabel={`Open ${candidate.display_name}'s full profile`}
          onPress={onOpen}
          style={styles.hit}
        />
      </View>
    </View>
  );
}

export function ProfileSheet({
  visible,
  onClose,
  name,
  age,
  genders,
  looking,
  habits,
  about,
  interests,
  turnOns,
  boosted,
  alignment,
  distance,
  photos,
  photoIndex,
  onPhoto,
  synthetic,
  testing_banner,
}: {
  visible: boolean;
  onClose: () => void;
  name: string;
  age: string;
  genders: string[];
  looking: string;
  habits?: string;
  about: string;
  interests: { id: string; label: string; icon: string }[];
  turnOns: string[];
  boosted?: boolean;
  alignment?: string | null;
  distance: string;
  photos: string[];
  photoIndex: number;
  onPhoto: (index: number) => void;
  synthetic?: boolean;
  testing_banner?: string;
}) {
  const photo = photos[photoIndex];
  const fake = testingBanner({ synthetic, testing_banner });
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{name}</Text>
            <View style={styles.sheetActions}>
              <ReportFab embedded />
              <Pressable accessibilityLabel="Close" onPress={onClose} style={styles.close}>
                <Text style={styles.closeMark}>×</Text>
              </Pressable>
            </View>
          </View>
          <ScrollView>
            <View style={styles.hero}>
              {photo ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: resolvedMediaUri(photo), headers: mediaHeaders() }}
                  style={styles.heroPhoto}
                />
              ) : (
                <View style={styles.monogramWrap}>
                  <Text style={styles.monogram}>{name[0]}</Text>
                </View>
              )}
              {photos.length > 1 ? (
                <>
                  <Pressable
                    onPress={() => onPhoto((photoIndex - 1 + photos.length) % photos.length)}
                    style={[styles.nav, styles.prev]}
                  >
                    <Text style={styles.navMark}>‹</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onPhoto((photoIndex + 1) % photos.length)}
                    style={[styles.nav, styles.next]}
                  >
                    <Text style={styles.navMark}>›</Text>
                  </Pressable>
                  <Text style={styles.count}>
                    {photoIndex + 1} / {photos.length}
                  </Text>
                </>
              ) : null}
            </View>
            <View style={styles.sheetCopy}>
              {fake ? <Text style={styles.fakeBannerSheet}>{fake}</Text> : null}
              <View style={styles.badges}>
                {boosted ? <Text style={styles.boost}>Boost</Text> : null}
                {alignment ? <Text style={styles.align}>{alignment}</Text> : null}
                <Text style={styles.distance}>{distance}</Text>
              </View>
              <Text style={styles.sheetName}>
                {name} <Text style={styles.sheetAge}>{age}</Text>
              </Text>
              {genders.length ? <Text style={styles.gender}>{genders.join(" · ")}</Text> : null}
              <Text style={styles.lookingDark}>{looking}</Text>
              {habits ? <Text style={styles.habitsDark}>{habits}</Text> : null}
              <Text style={styles.about}>{about}</Text>
              {interests.length ? (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>✨ Interests</Text>
                  <View style={styles.traits}>
                    {interests.map((tag) => (
                      <Text key={tag.id} style={styles.traitDark}>
                        {tag.icon} {tag.label}
                      </Text>
                    ))}
                  </View>
                </View>
              ) : null}
              {turnOns.length ? (
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>⚡ Turn ons</Text>
                  <Text style={styles.habitsDark}>{turnOns.join(" · ")}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 240,
    position: "relative",
    shadowColor: theme.roseDeep,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
  },
  surface: {
    backgroundColor: theme.blush,
    borderColor: theme.line,
    borderRadius: 28,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
  },
  photo: {
    ...StyleSheet.absoluteFill,
  },
  monogramWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  monogram: {
    color: "rgba(255,255,255,0.16)",
    fontSize: 180,
    fontWeight: "900",
  },
  nav: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    top: "46%",
    width: 44,
    zIndex: 8,
  },
  prev: {
    left: 10,
  },
  next: {
    right: 10,
  },
  navMark: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 28,
  },
  fakeBanner: {
    backgroundColor: "#F5C542",
    color: "#1A1400",
    fontSize: 11,
    fontWeight: "800",
    left: 0,
    letterSpacing: 0.2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute",
    right: 0,
    textAlign: "center",
    top: 0,
    zIndex: 12,
  },
  fakeBannerSheet: {
    backgroundColor: "#F5C542",
    borderRadius: 12,
    color: "#1A1400",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 12,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "center",
  },
  count: {
    backgroundColor: "rgba(0,0,0,0.34)",
    borderRadius: 999,
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 8,
  },
  countBelowBanner: {
    top: 46,
  },
  gradient: {
    backgroundColor: "rgba(7,7,9,0.72)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: "42%",
  },
  overlay: {
    bottom: 0,
    left: 0,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: 30,
    position: "absolute",
    right: 0,
    zIndex: 3,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  boost: {
    backgroundColor: theme.boost,
    borderRadius: 999,
    color: "#16161a",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
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
  distance: {
    backgroundColor: "rgba(20,20,23,0.62)",
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  name: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },
  age: {
    fontWeight: "500",
  },
  looking: {
    color: "#d7d7db",
    fontSize: 13,
    marginBottom: 6,
    textTransform: "capitalize",
  },
  habits: {
    color: "#c8c8d0",
    fontSize: 13,
    marginBottom: 6,
  },
  bio: {
    color: "#efeff1",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 13,
  },
  traits: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  trait: {
    backgroundColor: "rgba(255,197,110,0.14)",
    borderColor: "rgba(255,197,110,0.35)",
    borderRadius: 10,
    borderWidth: 1,
    color: "#fff",
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  more: {
    color: "#c8c8d0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 10,
    textTransform: "uppercase",
  },
  hit: {
    ...StyleSheet.absoluteFill,
    zIndex: 4,
  },
  sheetBackdrop: {
    backgroundColor: theme.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    overflow: "hidden",
  },
  sheetHeader: {
    alignItems: "center",
    borderBottomColor: theme.lineStrong,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
  },
  sheetTitle: {
    color: theme.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  sheetActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  close: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  closeMark: {
    color: theme.ink,
    fontSize: 28,
  },
  hero: {
    backgroundColor: "#FFD6E3",
    height: 260,
    overflow: "hidden",
  },
  heroPhoto: {
    height: "100%",
    width: "100%",
  },
  sheetCopy: {
    padding: 18,
  },
  sheetName: {
    color: theme.ink,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  sheetAge: {
    color: theme.muteDeep,
    fontWeight: "500",
  },
  gender: {
    color: theme.muteDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 8,
    textTransform: "uppercase",
  },
  lookingDark: {
    color: theme.mute,
    fontSize: 13,
    marginTop: 8,
  },
  habitsDark: {
    color: theme.mute,
    fontSize: 13,
    marginTop: 6,
  },
  about: {
    color: theme.ink,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  block: {
    backgroundColor: "#FFF7EA",
    borderColor: "#F0C98A",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  blockTitle: {
    color: "#7A4A12",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  traitDark: {
    backgroundColor: "#FFE4B8",
    borderRadius: 10,
    color: "#7A4A12",
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
});
