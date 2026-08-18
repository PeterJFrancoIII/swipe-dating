import { Tabs } from "expo-router";

import { GetFkdProximityHost } from "@/components/GetFkdProximityHost";

export default function TabLayout() {
  return (
    <>
      <GetFkdProximityHost />
      <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Swipe" }} />
      <Tabs.Screen name="matches" options={{ title: "Matches" }} />
    </Tabs>
    </>
  );
}
