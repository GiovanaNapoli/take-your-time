import { View, StyleSheet, Text, Dimensions } from "react-native";
import {
  PanGestureHandler,
  type PanGestureHandlerProps,
  type PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { colors } from "../../styles/colors";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Notepad, Trash, Checks } from "phosphor-react-native";
import type { Task as TaskType } from "../../types";

interface TaskProps
  extends Pick<PanGestureHandlerProps, "simultaneousHandlers">,
    TaskType {
  onDelete(id: number): void;
  onUpdate(id: number, isDone: number): void;
}

const { width } = Dimensions.get("window");
const TRANSLATE_X_THRESHOLD = -width * 0.3;
const TRANSLATE_X_CONFIRMHOLD = width * 0.3;
const TASK_HEIGHT = 88;

export default function Task({
  id,
  title,
  description,
  simultaneousHandlers,
  onDelete,
  onUpdate,
}: TaskProps) {
  const styles = useStyles();

  const translateX = useSharedValue(0);
  const taskHeight = useSharedValue(TASK_HEIGHT);
  const opacity = useSharedValue(1);

  const deleteTask = async () => {
    await onDelete(id);
  };

  const updateTask = async () => {
    await onUpdate(id, 1);
  };

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: () => {
      const shouldBeDismissed = translateX.value < TRANSLATE_X_THRESHOLD;
      const shouldBeConfirmed = translateX.value > TRANSLATE_X_CONFIRMHOLD;
      if (shouldBeDismissed) {
        translateX.value = withTiming(-width);
        taskHeight.value = withTiming(0);
        opacity.value = withTiming(0, undefined, (finished) => {
          if (finished) {
            runOnJS(deleteTask)();
          }
        });
      } else if (shouldBeConfirmed) {
        translateX.value = withTiming(width);
        taskHeight.value = withTiming(0);
        opacity.value = withTiming(0, undefined, (finished) => {
          if (finished) {
            runOnJS(updateTask)();
          }
        });
      } else {
        translateX.value = withTiming(0);
      }
    },
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const rIconContainerStyle = useAnimatedStyle(() => {
    const opacity = withTiming(
      translateX.value < TRANSLATE_X_THRESHOLD ? 1 : 0
    );
    return {
      opacity,
    };
  });
  const rIconContainerStylet = useAnimatedStyle(() => {
    const opacity = withTiming(
      translateX.value > TRANSLATE_X_CONFIRMHOLD ? 1 : 0
    );
    return {
      opacity,
    };
  });

  const rTaskContainerStyle = useAnimatedStyle(() => {
    return {
      height: taskHeight.value,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={rTaskContainerStyle}>
      <Animated.View style={[styles.confirmButton, rIconContainerStylet]}>
        <Checks size={24} color={colors.green[500]} />
      </Animated.View>
      <Animated.View style={[styles.deleteButton, rIconContainerStyle]}>
        <Trash size={24} color={colors.red[500]} />
      </Animated.View>
      <PanGestureHandler
        simultaneousHandlers={simultaneousHandlers}
        onGestureEvent={panGesture}
      >
        <Animated.View key={id} style={[styles.container, rStyle]}>
          <Notepad size={34} color={colors.white} />
          <View style={{ gap: 4 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}

function useStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: colors.zinc[900],
      height: TASK_HEIGHT,
      padding: 8,
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 8,
      borderRadius: 4,
    },
    title: {
      color: colors.white,
      fontFamily: "aptos-black",
      fontSize: 16,
    },
    description: {
      color: colors.zinc[500],
      fontFamily: "aptos-regular",
      fontSize: 16,
    },
    confirmButton: {
      width: TASK_HEIGHT,
      position: "absolute",
      color: colors.white,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
      height: TASK_HEIGHT,
      borderRadius: 6,
    },
    deleteButton: {
      width: TASK_HEIGHT,
      position: "absolute",
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      height: TASK_HEIGHT,
      borderRadius: 6,
    },
    deleteButtonText: {
      color: colors.white,
      fontFamily: "aptos-black",
    },
  });
}
