# Dynamic Island (Live Activity) — Built From Scratch

This guide explains how the **Dynamic Island** feature was implemented in this app so you can understand and reuse the pattern. It assumes you know basic React Native and Swift.

---

## 1. What Are Live Activities and the Dynamic Island?

- **Live Activity**: A small, updatable UI that the system shows **outside** your app — on the **Lock Screen** and, on supported devices, inside the **Dynamic Island** (the pill at the top of iPhone 14 Pro and later).
- **Dynamic Island**: The black pill that can expand to show more detail. It’s one of the places where a Live Activity can appear.
- **Requirements**: iOS **16.2+**. Dynamic Island hardware: **iPhone 14 Pro** and later (older devices still get Lock Screen Live Activity).

So: we use **ActivityKit** to define a **Live Activity**. The same activity is used for:
- **Lock Screen** (rectangular/circular/inline widgets)
- **Dynamic Island** (compact, minimal, and expanded UI)

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React Native (JavaScript/TypeScript)                             │
│  • LiveActivityService.ts  → start/update/end, read state         │
│  • DynamicIslandSettingsScreen.tsx  → UI: toggle, mode picker      │
└───────────────────────────────┬───────────────────────────────────┘
                                │ NativeModules.LiveActivityManager
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Main App (iOS – Swift)                                           │
│  • LiveActivityManager.swift  → start/update/end Activity         │
│  • LiveActivityManager.m      → RCT bridge (expose to RN)          │
│  • Uses: YearProgressActivityAttributes + YearProgressContentState │
└───────────────────────────────┬───────────────────────────────────┘
                                │ ActivityKit (Activity.request / update / end)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  System (ActivityKit)                                             │
│  • Owns the Live Activity lifecycle                               │
│  • Renders UI using the Widget Extension                          │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Widget Extension (Swift + SwiftUI)                              │
│  • YearProgressWidget.swift       → Dynamic Island + Lock Screen  │
│  • YearProgressActivityAttributes → shared data model             │
└─────────────────────────────────────────────────────────────────┘
```

**Flow in one sentence**: React Native calls a native module → the main app starts/updates/ends a Live Activity via ActivityKit → the **Widget Extension** (which you write in SwiftUI) draws the Dynamic Island and Lock Screen UI from the activity’s **attributes** and **content state**.

---

## 3. Step-by-Step: What We Built

### Step 1 — Define the Data Model (Attributes + Content State)

**File:** `ios/YearProgressWidget/YearProgressActivityAttributes.swift`

ActivityKit needs two things:

1. **Attributes** — **static** for the lifetime of the activity (e.g. “this is year progress” vs “countdown”).
2. **Content state** — **dynamic** data that can change when you update the activity (e.g. days passed, days left, percentage). Must be **Codable** and stay under **4KB**.

We defined:

- **`LiveActivityMode`**  
  Enum: `yearProgress`, `countdown`, `streak`, `event`. Stored in attributes (static).

- **`YearProgressActivityAttributes`**  
  Conforms to `ActivityAttributes`, holds `mode: LiveActivityMode`.  
  `ContentState` is set to `YearProgressContentState`.

- **`YearProgressContentState`**  
  Holds: `year`, `percentage`, `daysPassed`, `daysLeft`, `totalDays`, optional `countdownLabel`, `streakCount`, `eventName`, `eventDaysLeft`.  
  Includes a static helper `makeYearProgress(for: Date)` that computes year progress from a date.

**Important:** This Swift file is added to **both** the main app target and the Widget Extension target so both can use the same types.

---

### Step 2 — Widget Extension and Activity Configuration

**File:** `ios/YearProgressWidget/YearProgressWidget.swift`

The **Widget Extension** is a separate target in Xcode. It uses **ActivityKit** to register how to display the Live Activity.

- **`ActivityConfiguration(for: YearProgressActivityAttributes.self) { context in ... } dynamicIsland: { context in ... }`**
  - First closure: **Lock Screen** UI (when the activity is on the lock screen).
  - `dynamicIsland`: **Dynamic Island** UI (compact, minimal, expanded).

**Lock Screen**  
One view that receives `context.state` (content state) and `context.attributes.mode`. We show year, percentage, days passed/left, and handle `yearProgress` vs `countdown` vs other modes.

**Dynamic Island** has four parts:

| Part | Role |
|------|------|
| **compactLeading** | Left side of the pill (e.g. “35d” passed). |
| **compactTrailing** | Right side (e.g. “330d left”). |
| **minimal** | When the system shows a very small view (e.g. single “9%”). |
| **expanded** | When the user long-presses or taps: **leading**, **trailing**, **center**, **bottom** regions. |

Each of these is a SwiftUI view that receives `context.state` and `context.attributes.mode` and renders accordingly (year progress vs countdown, etc.).

So: **the same activity** drives both Lock Screen and Dynamic Island; we just switch on `mode` and `state` to change labels and layout.

---

### Step 3 — Main App: Start / Update / End the Activity

**File:** `ios/wallpe/LiveActivityManager.swift`

The **main app** (your React Native app’s iOS target) must:

1. Create the activity with **attributes** + initial **content state**.
2. Hold a reference to the current **`Activity<YearProgressActivityAttributes>`**.
3. Update it when data changes.
4. End it when the user turns the feature off.

We do this in a class exposed to React Native:

- **`startLiveActivity(mode:options:resolver:rejecter:)`**
  - Check **Live Activities are allowed** (`ActivityAuthorizationInfo().areActivitiesEnabled`).
  - Build **attributes**: `YearProgressActivityAttributes(mode: mode)`.
  - Build **content state**: e.g. `YearProgressContentState.makeYearProgress(for: Date())` (and for other modes, set streak/event data from `options`).
  - Call **`Activity.request(attributes:content:pushType:)`** with an `ActivityContent(state:staleDate:)`.
  - Store the returned **`Activity<...>`** in a static variable and **resolve(true)**.

- **`updateLiveActivity(resolver:rejecter:)`**
  - Take the stored **current activity**.
  - Build a new **content state** (e.g. same `makeYearProgress(for: Date())`).
  - Call **`activity.update(content)`**.
  - Resolve/reject so RN knows success/failure.

- **`endLiveActivity(resolver:rejecter:)`**
  - Take the stored activity.
  - Call **`activity.end(content, dismissalPolicy: .default)`**.
  - Set the stored activity to **nil** and resolve.

We also persist “enabled” and “mode” in **App Group UserDefaults** so the app and widget can stay in sync if needed. The **same App Group** must be in the main app and the widget extension entitlements.

**Important:** All of this runs in the **main app process**. The Widget Extension is only for **drawing**; it does not start or end activities. Only the app can do that.

---

### Step 4 — Expose the Native Module to React Native

**File:** `ios/wallpe/LiveActivityManager.m`

React Native’s bridge needs an **Objective-C** declaration of the module and its methods:

```objc
RCT_EXTERN_MODULE(LiveActivityManager, NSObject)

RCT_EXTERN_METHOD(startLiveActivity:(NSString *)mode
                  options:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateLiveActivity:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endLiveActivity:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
```

- **`LiveActivityManager`** is the class name (must match the Swift `@objc(LiveActivityManager)` class).
- Method names and argument types must match the Swift signatures. Promise = `resolve` + `reject`.

So: **Swift** implements the logic; **ObjC** only declares what RN can call. No `async` in the ObjC declaration — we use the promise callbacks.

---

### Step 5 — React Native: Service and UI

**File:** `src/services/LiveActivityService.ts`

A thin JS/TS layer that:

- Gets **`NativeModules.LiveActivityManager`** (only on iOS).
- Exposes:
  - **`isSupported()`** — iOS and module exists.
  - **`startLiveActivity(mode, options?)`** — calls native, then stores “enabled” and “mode” in AsyncStorage.
  - **`updateLiveActivity()`** — e.g. when app comes to foreground, to refresh the displayed date.
  - **`endLiveActivity()`** — calls native, then clears stored state.
  - **`isLiveActivityEnabled()`** / **`getLiveActivityMode()`** — read from AsyncStorage.

So the **source of truth** for “is it running?” is the native side; we mirror it in AsyncStorage for the settings screen and for deciding when to call **update**.

**File:** `src/screens/SettingsScreen/DynamicIslandSettingsScreen.tsx`

- Uses **`LiveActivityService`** and **`useSubscription`** (for premium gating).
- On load, reads **`isLiveActivityEnabled()`** and **`getLiveActivityMode()`** and sets local state (toggle + mode).
- **Toggle On** → **`startLiveActivity(mode)`** (and show error if not allowed / not supported).
- **Toggle Off** → **`endLiveActivity()`**.
- **Mode change** (Year progress vs Days left) → if currently enabled, **end** then **start** with new mode.
- **AppState “active”** → if enabled, call **`updateLiveActivity()`** so the island shows today’s data.

This is the only place in the React Native app that **starts** or **ends** the Live Activity; the rest is native and the widget.

---

## 4. Data Flow Summary

1. **User turns on Dynamic Island** in the settings screen.
2. **React Native** calls **`LiveActivityManager.startLiveActivity(mode, options)`**.
3. **Main app (Swift)** checks authorization, builds **Attributes + ContentState**, calls **`Activity.request(...)`**, stores the **Activity** reference.
4. **System** starts the Live Activity and asks the **Widget Extension** to render.
5. **Widget Extension** uses **`context.state`** and **`context.attributes`** to draw Lock Screen and Dynamic Island (compact / minimal / expanded).
6. When the app comes to foreground (or you want to refresh), RN calls **`updateLiveActivity()`** → native gets current **Activity**, builds new **ContentState** (e.g. new date), calls **`activity.update(content)`** → system notifies the widget → UI updates.
7. **User turns off** → RN calls **`endLiveActivity()`** → native calls **`activity.end(...)`** and clears the stored reference → activity disappears.

---

## 5. Key Files Checklist

| Layer | File | Purpose |
|-------|------|--------|
| **Data model** | `YearProgressWidget/YearProgressActivityAttributes.swift` | Attributes (mode) + ContentState (year, %, days, etc.). Shared by app + widget. |
| **Widget UI** | `YearProgressWidget/YearProgressWidget.swift` | Lock Screen view + Dynamic Island (compactLeading/Trailing, minimal, expanded regions). |
| **Native control** | `wallpe/LiveActivityManager.swift` | Start / update / end Activity; hold reference; App Group prefs. |
| **RN bridge** | `wallpe/LiveActivityManager.m` | Expose LiveActivityManager to React Native. |
| **JS API** | `src/services/LiveActivityService.ts` | start/update/end + AsyncStorage mirror. |
| **User UI** | `src/screens/SettingsScreen/DynamicIslandSettingsScreen.tsx` | Toggle, mode picker, errors, refresh on foreground. |

---

## 6. Xcode / Project Setup (What You Need to Have)

- **Widget Extension target** that uses **ActivityKit** and links the same **YearProgressActivityAttributes** (and any shared types).
- **App Group** entitlement on **both** the main app and the widget extension (e.g. `group.com.developernick.wallpe`), if you share UserDefaults.
- **Main app target** includes:
  - **LiveActivityManager.swift** and **LiveActivityManager.m**
  - **YearProgressActivityAttributes.swift** (so it can create `Activity<YearProgressActivityAttributes>` and `YearProgressContentState`).
- **Info.plist** for the widget: **NSExtension** with **WidgetKit** and **ActivityKit** usage if required by Apple’s docs.

---

## 7. Concepts to Remember (Long Term)

- **Live Activity** = one running “instance” of your activity type. It’s identified by **Attributes** (static) and has **Content State** (dynamic, &lt; 4KB).
- **Only the main app** can **start**, **update**, and **end** activities. The **Widget Extension** only **renders** what the system gives it (`context.state` / `context.attributes`).
- **Dynamic Island** is just another **presentation** of the same Live Activity (compact / minimal / expanded). Lock Screen is another. Same data, different SwiftUI views.
- **React Native** talks to the **main app** via the **native module**; the main app talks to the **system** via **ActivityKit**. The widget extension is never called from RN directly.
- **Content state** must be **Codable** and small. Recompute it (e.g. from `Date()`) in the app when you **start** or **update**; the widget only displays it.

Once this pipeline is in place (data model → widget UI → native start/update/end → bridge → RN service → settings screen), adding a new **mode** (e.g. “event”) is mostly: extend the data model, add branches in the widget SwiftUI, and pass options from RN when starting the activity.
