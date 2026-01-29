import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct YearProgressEntry: TimelineEntry {
    let date: Date
    let year: Int
    let daysPassed: Int
    let daysLeft: Int
    let totalDays: Int
    let percentage: Double
}

// MARK: - Timeline Provider

struct YearProgressProvider: TimelineProvider {
    func placeholder(in context: Context) -> YearProgressEntry {
        YearProgressEntry(
            date: Date(),
            year: Calendar.current.component(.year, from: Date()),
            daysPassed: 29,
            daysLeft: 336,
            totalDays: 365,
            percentage: 8.0
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (YearProgressEntry) -> Void) {
        completion(makeEntry(for: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<YearProgressEntry>) -> Void) {
        let now = Date()
        let entry = makeEntry(for: now)
        let calendar = Calendar.current
        let startOfTomorrow = calendar.startOfDay(for: calendar.date(byAdding: .day, value: 1, to: now)!)
        let timeline = Timeline(entries: [entry], policy: .after(startOfTomorrow))
        completion(timeline)
    }

    private func makeEntry(for date: Date) -> YearProgressEntry {
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
        return YearProgressEntry(
            date: date,
            year: year,
            daysPassed: daysPassed,
            daysLeft: daysLeft,
            totalDays: totalDays,
            percentage: percentage
        )
    }
}

// MARK: - Widget View

struct YearProgressWidgetView: View {
    var entry: YearProgressEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("\(entry.year)")
                .font(.headline)
                .fontWeight(.bold)
            Text("Days passed: \(entry.daysPassed)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            Text("Days left: \(entry.daysLeft)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            ProgressView(value: entry.percentage / 100)
                .tint(.accentColor)
            Text(String(format: "%.1f%% of year passed", entry.percentage))
                .font(.subheadline)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding()
        .background(Color(.systemGray6))
        .widgetURL(URL(string: "wallpe://year-progress"))
    }
}

// MARK: - Widget Definition

struct YearProgressWidget: Widget {
    let kind: String = "YearProgressWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: YearProgressProvider()) { entry in
            YearProgressWidgetView(entry: entry)
        }
        .configurationDisplayName("Year Progress")
        .description("Track the current year's progress: days passed, days left, and percentage.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Previews

struct YearProgressWidget_Previews: PreviewProvider {
    static var previews: some View {
        YearProgressWidgetView(entry: YearProgressEntry(
            date: Date(),
            year: 2025,
            daysPassed: 29,
            daysLeft: 336,
            totalDays: 365,
            percentage: 8.0
        ))
    }
}
