import {
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../styles/colors";
import { Minus } from "phosphor-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { Controller, useForm } from "react-hook-form";

interface SheetProps {
  onClose: () => void;
  onSubmit(title: string, description: string): void;
}

type FormFields = {
  title: string;
  description: string;
};

const { width } = Dimensions.get("window");
export const SHEET_HEIGHT = 490;

export default function Sheet({ onClose, onSubmit }: SheetProps) {
  const { handleSubmit, control } = useForm<FormFields>({
    defaultValues: { title: "", description: "" },
  });

  const styles = useStyles();
  const offset = useSharedValue(0);

  const close = () => {
    offset.value = 0;
    onClose();
  };

  const pan = Gesture.Pan()
    .onChange((event) => {
      const offsetDelta = event.changeY + offset.value;
      const clamp = Math.max(-20, offsetDelta);

      offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);
    })
    .onFinalize(() => {
      if (offset.value < SHEET_HEIGHT / 3) {
        offset.value = withSpring(0);
      } else {
        offset.value = withTiming(SHEET_HEIGHT, {}, () => {
          runOnJS(close)();
        });
      }
    });

  const translateY = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  const handleCreateTask = (data: FormFields) => {
    onSubmit(data.title, data.description);
    close();
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.container, translateY]}
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown}
      >
        <Minus
          size={32}
          color={colors.white}
          style={styles.icon}
          weight="bold"
        />
        <Text style={styles.title}>Vamos criar uma nova tarefa!</Text>
        <View style={{ gap: 12 }}>
          <View>
            <Text style={styles.label}>Nome da tarefa</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Fazer exercicios"
                  style={styles.input}
                  placeholderTextColor={colors.zinc[500]}
                />
              )}
            />
          </View>
          <View>
            <Text style={styles.label}>Detalhes</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Fazer 2h de musculação"
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.input,
                    { height: 126, textAlignVertical: "top" },
                  ]}
                  placeholderTextColor={colors.zinc[500]}
                />
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(handleCreateTask)}
          >
            <Text style={styles.buttonText}>Criar tarefa</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );

  function useStyles() {
    return StyleSheet.create({
      container: {
        paddingHorizontal: 32,
        width,
        height: SHEET_HEIGHT,
        backgroundColor: colors.zinc[900],
        position: "absolute",
        bottom: -20 * 1.3,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
      title: {
        fontFamily: "aptos-black",
        fontSize: 24,
        color: "white",
        textAlign: "left",
        marginTop: 16,
      },
      icon: { alignSelf: "center", marginTop: 12 },
      label: {
        color: colors.zinc[500],
        fontFamily: "aptos-regular",
        fontSize: 18,
      },
      input: {
        backgroundColor: colors.zinc[800],
        borderRadius: 4,
        paddingVertical: 20,
        paddingHorizontal: 10,
        marginTop: 10,
        color: colors.white,
        height: 56,
      },
      button: {
        backgroundColor: colors.green[500],
        padding: 16,
        borderRadius: 4,
        marginTop: 16,
        height: 56,
        alignItems: "center",
      },
      buttonText: {
        color: colors.white,
        fontFamily: "aptos-black",
        fontSize: 18,
      },
    });
  }
}
