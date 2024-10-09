import "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { Home } from "./src/app/home";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "./drizzle/migrations";
import { ActivityIndicator, Text, View } from "react-native";

const DATABASE_NAME = "database.db";
const expoDB = openDatabaseSync(DATABASE_NAME);
const db = drizzle(expoDB);

export default function App() {
  const [loaded, error] = useFonts({
    "aptos-black": require("./assets/fonts/aptos-black.ttf"),
    "aptos-regular": require("./assets/fonts/aptos.ttf"),
  });

  const { success, error: mError } = useMigrations(db, migrations);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (mError) {
    console.error(mError);
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Error: {mError.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <ActivityIndicator
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      />
    );
  }

  return (
    <SQLiteProvider databaseName={DATABASE_NAME}>
      <GestureHandlerRootView>
        <Home />
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}
