import { Plus } from "phosphor-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../../styles/colors";
import { StyleSheet } from "react-native";

interface ButtonProps {
  onPress: () => void;
}

export default function Button({ onPress }: ButtonProps) {
  const styles = useStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={styles.container}
    >
      <Plus size={24} color={colors.white} />
    </TouchableOpacity>
  );

  function useStyles() {
    return StyleSheet.create({
      container: {
        width: 64,
        height: 64,
        borderRadius: 40,
        backgroundColor: colors.green[500],
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 32,
        right: 0,
      },
    });
  }
}
