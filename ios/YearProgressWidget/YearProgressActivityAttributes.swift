import ActivityKit
import Foundation

// MARK: - Live Activity Mode

enum LiveActivityMode: String, Codable, Hashable {
    case yearProgress
    case countdown
    case dayProgress  // Separate day status: today's % done / % left
    case monthProgress  // Month progress: days passed/left in current month
    case pet  // Interactive virtual pet
    case streak
    case event
}

// MARK: - Activity Attributes (shared by app and widget extension)

struct YearProgressActivityAttributes: ActivityAttributes {
    typealias ContentState = YearProgressContentState

    // Static: does not change during the activity
    public let mode: LiveActivityMode

    // Dynamic state (ContentState) is in YearProgressContentState
}

// MARK: - Content State (dynamic, < 4KB)

struct YearProgressContentState: Codable, Hashable {
    // Year progress / countdown
    var year: Int
    var percentage: Double
    var daysPassed: Int
    var daysLeft: Int
    var totalDays: Int

    /// Percentage of the current 24h day already completed (0–100). Day left = 100 - dayProgressPercentage. Optional for backward compatibility.
    var dayProgressPercentage: Double?

    // Month progress (for mode == .monthProgress)
    var month: Int?
    var monthPercentage: Double?
    var monthDaysPassed: Int?
    var monthDaysLeft: Int?
    var monthTotalDays: Int?

    // Countdown label e.g. "284 days left"
    var countdownLabel: String?

    // Pet state (for mode == .pet)
    var petHunger: Int?
    var petHappiness: Int?
    var petEnergy: Int?
    var petName: String?
    var petType: String?
    var petLastFed: Date?
    var petLastPlayed: Date?
    /// Current animation/action for pixel pet: idle | eating | playing | sleeping | sad | waving
    var petCurrentAction: String?

    // Streak (for mode == .streak)
    var streakCount: Int?

    // Event (for mode == .event)
    var eventName: String?
    var eventDaysLeft: Int?

    static func makeYearProgress(for date: Date) -> YearProgressContentState {
        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: date) ?? 1
        var endOfYear = DateComponents()
        endOfYear.year = year
        endOfYear.month = 12
        endOfYear.day = 31
        let lastDay = calendar.date(from: endOfYear)!
        let totalDays = calendar.ordinality(of: .day, in: .year, for: lastDay) ?? 365
        let daysPassed = dayOfYear
        let daysLeft = totalDays - daysPassed
        let percentage = totalDays > 0 ? (Double(daysPassed) / Double(totalDays)) * 100 : 0
        let startOfDay = calendar.startOfDay(for: date)
        let elapsedInDay = date.timeIntervalSince(startOfDay)
        let secondsPerDay = 24.0 * 60.0 * 60.0
        let dayProgressPercentage = min(100, max(0, (elapsedInDay / secondsPerDay) * 100))
        
        // Month progress calculation
        let month = calendar.component(.month, from: date)
        let dayOfMonth = calendar.component(.day, from: date)
        let monthRange = calendar.range(of: .day, in: .month, for: date)!
        let monthTotalDays = monthRange.count
        let monthDaysPassed = dayOfMonth
        let monthDaysLeft = monthTotalDays - monthDaysPassed
        let monthPercentage = monthTotalDays > 0 ? (Double(monthDaysPassed) / Double(monthTotalDays)) * 100 : 0
        
        return YearProgressContentState(
            year: year,
            percentage: percentage,
            daysPassed: daysPassed,
            daysLeft: daysLeft,
            totalDays: totalDays,
            dayProgressPercentage: dayProgressPercentage,
            month: month,
            monthPercentage: monthPercentage,
            monthDaysPassed: monthDaysPassed,
            monthDaysLeft: monthDaysLeft,
            monthTotalDays: monthTotalDays,
            countdownLabel: "\(daysLeft) days left",
            petHunger: nil,
            petHappiness: nil,
            petEnergy: nil,
            petName: nil,
            petType: nil,
            petLastFed: nil,
            petLastPlayed: nil,
            petCurrentAction: nil,
            streakCount: nil,
            eventName: nil,
            eventDaysLeft: nil
        )
    }
}
