import Foundation
import React

#if canImport(ActivityKit)
import ActivityKit
#endif

private let appGroupId = "group.com.developernick.wallpe"

@objc(LiveActivityManager)
class LiveActivityManager: NSObject {

    @available(iOS 16.2, *)
    private static var currentActivity: Activity<YearProgressActivityAttributes>? {
        get { _currentActivity as? Activity<YearProgressActivityAttributes> }
        set { _currentActivity = newValue }
    }
    private static var _currentActivity: Any?

    private var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: appGroupId)
    }

    private func saveLiveActivityPreference(enabled: Bool, mode: String) {
        sharedDefaults?.set(enabled, forKey: "liveActivityEnabled")
        sharedDefaults?.set(mode, forKey: "liveActivityMode")
        sharedDefaults?.synchronize()
    }

    @available(iOS 16.2, *)
    private func makeContentState(mode: LiveActivityMode, options: [String: Any]?, at date: Date = Date()) -> YearProgressContentState {
        var state = YearProgressContentState.makeYearProgress(for: date)
        switch mode {
        case .yearProgress, .countdown, .dayProgress, .monthProgress:
            break
        case .pet:
            loadPetState(&state)
        case .streak:
            if let count = options?["streakCount"] as? NSNumber {
                state.streakCount = count.intValue
            }
        case .event:
            state.eventName = options?["eventName"] as? String
            if let ts = options?["eventDate"] as? NSNumber {
                let eventDate = Date(timeIntervalSince1970: ts.doubleValue / 1000.0)
                let calendar = Calendar.current
                state.eventDaysLeft = max(0, calendar.dateComponents([.day], from: date, to: eventDate).day ?? 0)
            }
        }
        return state
    }

    @available(iOS 16.2, *)
    private func makeAttributes(mode: LiveActivityMode) -> YearProgressActivityAttributes {
        YearProgressActivityAttributes(mode: mode)
    }

    @objc
    func startLiveActivity(_ mode: String, options: NSDictionary?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            startLiveActivityInternal(mode: mode, options: options, resolver: resolve, rejecter: reject)
        } else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.2 or later", nil)
        }
    }

    @available(iOS 16.2, *)
    private func startLiveActivityInternal(mode: String, options: NSDictionary?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let modeEnum = LiveActivityMode(rawValue: mode) else {
            reject("INVALID_MODE", "Unknown mode: \(mode). Valid modes: yearProgress, countdown, dayProgress, monthProgress, pet, streak, event", nil)
            return
        }
        let authInfo = ActivityAuthorizationInfo()
        guard authInfo.areActivitiesEnabled else {
            reject("NOT_ALLOWED", "Live Activities are disabled. Enable in Settings > Face ID & Passcode > Live Activities", nil)
            return
        }
        let opts = options as? [String: Any]
        let attributes = makeAttributes(mode: modeEnum)
        let state = makeContentState(mode: modeEnum, options: opts)
        let calendar = Calendar.current
        let now = Date()
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let content = ActivityContent(state: state, staleDate: startOfTomorrow)
        do {
            let activity = try Activity.request(attributes: attributes, content: content, pushType: nil)
            Self.currentActivity = activity
            saveLiveActivityPreference(enabled: true, mode: mode)
            resolve(true)
        } catch {
            reject("START_FAILED", error.localizedDescription, error)
        }
    }

    @objc
    func updateLiveActivity(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                await updateLiveActivityInternal(resolver: resolve, rejecter: reject)
            }
        } else {
            resolve(false)
        }
    }

    @available(iOS 16.2, *)
    private func updateLiveActivityInternal(resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) async {
        guard let activity = Self.currentActivity else {
            DispatchQueue.main.async { resolve(false) }
            return
        }
        let mode = activity.attributes.mode
        let state = makeContentState(mode: mode, options: nil)
        let calendar = Calendar.current
        let now = Date()
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let content = ActivityContent(state: state, staleDate: startOfTomorrow)
        await activity.update(content)
        DispatchQueue.main.async { resolve(true) }
    }

    @objc
    func endLiveActivity(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                await endLiveActivityInternal(resolver: resolve, rejecter: reject)
            }
        } else {
            resolve(true)
        }
    }

    @available(iOS 16.2, *)
    private func endLiveActivityInternal(resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) async {
        guard let activity = Self.currentActivity else {
            DispatchQueue.main.async { resolve(true) }
            return
        }
        let state = makeContentState(mode: activity.attributes.mode, options: nil)
        let content = ActivityContent(state: state, staleDate: nil)
        await activity.end(content, dismissalPolicy: .default)
        Self.currentActivity = nil
        saveLiveActivityPreference(enabled: false, mode: activity.attributes.mode.rawValue)
        DispatchQueue.main.async { resolve(true) }
    }

    @objc
    func isLiveActivityActive(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            resolve(Self.currentActivity != nil)
        } else {
            resolve(false)
        }
    }

    @objc
    func checkAndRestoreLiveActivity(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                await checkAndRestoreLiveActivityInternal(resolver: resolve, rejecter: reject)
            }
        } else {
            resolve(false)
        }
    }

    @available(iOS 16.2, *)
    private func checkAndRestoreLiveActivityInternal(resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) async {
        if Self.currentActivity != nil {
            DispatchQueue.main.async { resolve(false) }
            return
        }
        guard let defaults = sharedDefaults,
              defaults.bool(forKey: "liveActivityEnabled"),
              let savedMode = defaults.string(forKey: "liveActivityMode"),
              let modeEnum = LiveActivityMode(rawValue: savedMode) else {
            DispatchQueue.main.async { resolve(false) }
            return
        }
        let attributes = makeAttributes(mode: modeEnum)
        let state = makeContentState(mode: modeEnum, options: nil)
        let calendar = Calendar.current
        let now = Date()
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let content = ActivityContent(state: state, staleDate: startOfTomorrow)
        do {
            let activity = try Activity.request(attributes: attributes, content: content, pushType: nil)
            Self.currentActivity = activity
            DispatchQueue.main.async { resolve(true) }
        } catch {
            saveLiveActivityPreference(enabled: false, mode: savedMode)
            DispatchQueue.main.async { resolve(false) }
        }
    }

    // MARK: - Pet State

    @available(iOS 16.2, *)
    private func loadPetState(_ state: inout YearProgressContentState) {
        guard let defaults = sharedDefaults else { return }
        state.petHunger = defaults.integer(forKey: "petHunger")
        if state.petHunger == 0 { state.petHunger = 50 }
        state.petHappiness = defaults.integer(forKey: "petHappiness")
        if state.petHappiness == 0 { state.petHappiness = 50 }
        state.petEnergy = defaults.integer(forKey: "petEnergy")
        if state.petEnergy == 0 { state.petEnergy = 50 }
        state.petName = defaults.string(forKey: "petName")
        state.petType = defaults.string(forKey: "petType") ?? "cat"
        state.petLastFed = defaults.object(forKey: "petLastFed") as? Date
        state.petLastPlayed = defaults.object(forKey: "petLastPlayed") as? Date
    }

    @available(iOS 16.2, *)
    private func savePetState(_ state: YearProgressContentState) {
        guard let defaults = sharedDefaults else { return }
        if let v = state.petHunger { defaults.set(v, forKey: "petHunger") }
        if let v = state.petHappiness { defaults.set(v, forKey: "petHappiness") }
        if let v = state.petEnergy { defaults.set(v, forKey: "petEnergy") }
        if let v = state.petName { defaults.set(v, forKey: "petName") }
        if let v = state.petType { defaults.set(v, forKey: "petType") }
        if let v = state.petLastFed { defaults.set(v, forKey: "petLastFed") }
        if let v = state.petLastPlayed { defaults.set(v, forKey: "petLastPlayed") }
        defaults.synchronize()
    }

    @available(iOS 16.2, *)
    private func updatePetStateAndActivity(action: String, stateUpdate: (inout YearProgressContentState) -> Void) async -> Bool {
        guard let activity = Self.currentActivity, activity.attributes.mode == .pet else { return false }
        var newState = makeContentState(mode: .pet, options: nil)
        stateUpdate(&newState)
        switch action {
        case "feed": newState.petCurrentAction = "eating"
        case "play": newState.petCurrentAction = "playing"
        case "rest": newState.petCurrentAction = "sleeping"
        default: break
        }
        savePetState(newState)
        let calendar = Calendar.current
        let now = Date()
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let content = ActivityContent(state: newState, staleDate: startOfTomorrow)
        await activity.update(content)
        // After 2.5s, clear action so widget shows idle again
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 2_500_000_000)
            guard Self.currentActivity != nil else { return }
            var idleState = makeContentState(mode: .pet, options: nil)
            idleState.petCurrentAction = "idle"
            let idleContent = ActivityContent(state: idleState, staleDate: startOfTomorrow)
            await activity.update(idleContent)
        }
        return true
    }

    @objc func feedPet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                let ok = await updatePetStateAndActivity(action: "feed") { s in
                    s.petHunger = min(100, (s.petHunger ?? 50) + 30)
                    s.petLastFed = Date()
                }
                DispatchQueue.main.async { resolve(ok) }
            }
        } else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.2 or later", nil)
        }
    }

    @objc func playWithPet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                let ok = await updatePetStateAndActivity(action: "play") { s in
                    s.petHappiness = min(100, (s.petHappiness ?? 50) + 20)
                    s.petEnergy = max(0, (s.petEnergy ?? 50) - 10)
                    s.petLastPlayed = Date()
                }
                DispatchQueue.main.async { resolve(ok) }
            }
        } else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.2 or later", nil)
        }
    }

    @objc func restPet(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.2, *) {
            Task {
                let ok = await updatePetStateAndActivity(action: "rest") { s in
                    s.petEnergy = min(100, (s.petEnergy ?? 50) + 40)
                }
                DispatchQueue.main.async { resolve(ok) }
            }
        } else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.2 or later", nil)
        }
    }

    @objc func getPetState(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let defaults = sharedDefaults else {
            reject("ERROR", "App Group not available", nil)
            return
        }
        let lastFed = defaults.object(forKey: "petLastFed") as? Date
        let lastPlayed = defaults.object(forKey: "petLastPlayed") as? Date
        let petState: [String: Any] = [
            "hunger": defaults.integer(forKey: "petHunger"),
            "happiness": defaults.integer(forKey: "petHappiness"),
            "energy": defaults.integer(forKey: "petEnergy"),
            "name": defaults.string(forKey: "petName") ?? "",
            "type": defaults.string(forKey: "petType") ?? "cat",
            "lastFed": (lastFed?.timeIntervalSince1970 ?? 0) * 1000,
            "lastPlayed": (lastPlayed?.timeIntervalSince1970 ?? 0) * 1000,
        ]
        resolve(petState)
    }

    @objc func setPetName(_ name: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        sharedDefaults?.set(name, forKey: "petName")
        sharedDefaults?.synchronize()
        if #available(iOS 16.2, *) {
            Task {
                await updateLiveActivityInternal(resolver: resolve, rejecter: reject)
            }
        } else {
            resolve(true)
        }
    }

    @objc func setPetType(_ type: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        sharedDefaults?.set(type, forKey: "petType")
        sharedDefaults?.synchronize()
        if #available(iOS 16.2, *) {
            Task {
                await updateLiveActivityInternal(resolver: resolve, rejecter: reject)
            }
        } else {
            resolve(true)
        }
    }

    @objc static func requiresMainQueueSetup() -> Bool { true }
}
