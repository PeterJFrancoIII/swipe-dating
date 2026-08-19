import { Image, type ImageStyle, type StyleProp } from "react-native";

const LOGO_ASPECT = 632 / 800;

export function GetFkdLogo({
  size = 72,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      accessibilityLabel="Get fk'd"
      resizeMode="contain"
      source={require("../assets/images/logo.png")}
      style={[{ height: size, width: Math.round(size * LOGO_ASPECT) }, style]}
    />
  );
}
