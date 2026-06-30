from collections import Counter, defaultdict
from datetime import datetime
from sqlalchemy.orm import Session
import math

from app.modules.applications.models import Application
from app.modules.career_insights.schemas import (
    CareerOverview,
    StatusAnalysis,
    StatusCount,
    CompanyAnalysis,
    CompanyPerformance,
    ResponseTimeAnalysis,
    MonthlyTrend,
    MonthlyTrendAnalysis,
    WeeklyApplicationCount,
    WeeklyConsistencyAnalysis,
)


# ==========================================
# HELPER FUNCTION
# ==========================================

def get_user_applications(db: Session, user_id: int):
    return (
        db.query(Application)
        .filter(Application.user_id == user_id)
        .all()
    )


# ==========================================
# FEATURE 1 - CAREER OVERVIEW
# ==========================================

def get_career_overview(db: Session, user_id: int):
    applications = get_user_applications(db, user_id)

    total_applications = len(applications)

    total_interviews = sum(
        1 for app in applications
        if app.status == "Interview"
    )

    total_offers = sum(
        1 for app in applications
        if app.status == "Offer"
    )

    total_rejections = sum(
        1 for app in applications
        if app.status == "Rejected"
    )

    success_rate = (
        (total_offers / total_applications) * 100
        if total_applications > 0
        else 0
    )

    # Most Common Status
    if applications:
        status_counter = Counter(app.status for app in applications)
        most_common_status = status_counter.most_common(1)[0][0]
    else:
        most_common_status = None

    # Most Active Month
    if applications:
        month_counter = Counter(
            app.created_at.strftime("%B")
            for app in applications
        )
        most_active_month = month_counter.most_common(1)[0][0]
    else:
        most_active_month = None

    # Average Response Time
    response_times = []

    for app in applications:
        if app.status != "Applied":
            response_times.append(
                (app.updated_at - app.created_at).days
            )

    average_response_time = (
        round(sum(response_times) / len(response_times), 2)
        if response_times
        else None
    )

    return CareerOverview(
        total_applications=total_applications,
        total_interviews=total_interviews,
        total_offers=total_offers,
        total_rejections=total_rejections,
        success_rate=round(success_rate, 2),
        most_common_status=most_common_status,
        most_active_month=most_active_month,
        average_response_time=average_response_time,
    )


# ==========================================
# FEATURE 2 - STATUS ANALYSIS
# ==========================================

def get_status_analysis(db: Session, user_id: int):
    applications = get_user_applications(db, user_id)

    status_counter = Counter(
        app.status for app in applications
    )

    statuses = [
        StatusCount(
            status=status,
            count=count
        )
        for status, count in status_counter.items()
    ]

    if not status_counter:
        recommendation = (
            "Start applying for internships to receive personalized career insights."
        )

    else:
        most_common_status = status_counter.most_common(1)[0][0]

        if most_common_status == "Applied":
            recommendation = (
                "Most of your applications are still in the Applied stage. "
                "Consider following up on applications that have been pending "
                "for more than 10–14 days."
            )

        elif most_common_status == "Interview":
            recommendation = (
                "You have several ongoing interview processes. Focus on interview "
                "preparation and timely follow-ups."
            )

        elif most_common_status == "Offer":
            recommendation = (
                "Excellent progress! Your applications are converting into offers. "
                "Continue applying strategically while evaluating your opportunities."
            )

        else:
            recommendation = (
                "Rejections are a normal part of the internship search. Review "
                "your resume, tailor applications to each role, and continue "
                "applying consistently."
            )

    return StatusAnalysis(
        statuses=statuses,
        recommendation=recommendation
    )


# ==========================================
# FEATURE 3 - COMPANY SUCCESS ANALYSIS
# ==========================================

def get_company_analysis(db: Session, user_id: int):
    applications = get_user_applications(db, user_id)

    company_stats = defaultdict(
        lambda: {
            "applications": 0,
            "interviews": 0,
            "offers": 0,
        }
    )

    for app in applications:

        company = company_stats[app.company_name]

        company["applications"] += 1

        if app.status == "Interview":
            company["interviews"] += 1

        elif app.status == "Offer":
            company["offers"] += 1

    companies = []

    for company_name, stats in company_stats.items():

        companies.append(
            CompanyPerformance(
                company_name=company_name,
                applications=stats["applications"],
                interviews=stats["interviews"],
                offers=stats["offers"],
            )
        )

    companies.sort(
        key=lambda company: (
            company.offers,
            company.interviews,
            company.applications,
        ),
        reverse=True,
    )

       # Company Recommendation
    if not companies:
        recommendation = (
            "Start applying to companies to receive personalized company insights."
        )

    else:
        best_company = companies[0]

        if best_company.offers > 0:
            recommendation = (
                f"{best_company.company_name} has produced your strongest results "
                f"with {best_company.offers} offer(s). Consider applying for similar "
                f"roles at this company or organizations like it."
            )

        elif best_company.interviews > 0:
            recommendation = (
                f"{best_company.company_name} has generated the highest number of "
                f"interview opportunities. Your profile appears to match well with "
                f"this company's hiring requirements."
            )

        else:
            recommendation = (
                "No interviews or offers have been received yet. Continue applying "
                "consistently and tailor your resume for each application."
            )

    return CompanyAnalysis(
        companies=companies,
        recommendation=recommendation
    )


# ==========================================
# FEATURE 4 - RESPONSE TIME ANALYSIS
# ==========================================

def get_response_time_analysis(db: Session, user_id: int):
    applications = get_user_applications(db, user_id)

    interview_days = []
    offer_days = []
    rejection_days = []

    for app in applications:

        delta = app.updated_at - app.created_at

        # Approximate response time (minimum 1 day)
        days = max(
            1,
            math.ceil(delta.total_seconds() / 86400)
        )

        if app.status == "Interview":
            interview_days.append(days)

        elif app.status == "Offer":
            offer_days.append(days)

        elif app.status == "Rejected":
            rejection_days.append(days)

    average_interview = (
        round(sum(interview_days) / len(interview_days), 2)
        if interview_days else None
    )

    average_offer = (
        round(sum(offer_days) / len(offer_days), 2)
        if offer_days else None
    )

    average_rejection = (
        round(sum(rejection_days) / len(rejection_days), 2)
        if rejection_days else None
    )

    available = [
        value for value in [
            average_interview,
            average_offer,
            average_rejection
        ] if value is not None
    ]

    if available:

        average = round(sum(available) / len(available))

        day_text = "day" if average == 1 else "days"

        recommendation = (
            f"Companies usually respond within approximately {average} {day_text}. "
            f"If an application has been pending longer than this, consider "
            f"sending a polite follow-up."
        )

    else:
        recommendation = (
            "There is not enough application history yet to estimate response times."
        )

    return ResponseTimeAnalysis(
        average_interview_response=average_interview,
        average_offer_response=average_offer,
        average_rejection_response=average_rejection,
        recommendation=recommendation
    )


# ==========================================
# FEATURE 5 - MONTHLY TRENDS
# ==========================================

def get_monthly_trends(db: Session, user_id: int):
    applications = get_user_applications(db, user_id)

    month_counter = Counter(
        app.created_at.strftime("%B")
        for app in applications
    )

    trends = []

    for month, count in month_counter.items():

        trends.append(
            MonthlyTrend(
                month=month,
                applications=count
            )
        )

    month_order = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12,
    }

    trends.sort(
        key=lambda x: month_order[x.month]
    )

    if trends:

        best_month = max(
            trends,
            key=lambda x: x.applications
        )

        recommendation = (
            f"{best_month.month} was your most productive month with "
            f"{best_month.applications} application(s)."
        )

    else:

        recommendation = (
            "No monthly trends are available yet. Start applying to build insights."
        )

    return MonthlyTrendAnalysis(
        trends=trends,
        recommendation=recommendation
    )


# ==========================================
# FEATURE 6 - APPLICATION CONSISTENCY
# ==========================================

def get_weekly_consistency(db: Session, user_id: int):
    applications = get_user_applications(db, user_id)

    week_counter = Counter()

    for app in applications:
        week = app.created_at.isocalendar().week
        week_counter[week] += 1

    weeks = []

    for week, count in sorted(week_counter.items()):
        weeks.append(
            WeeklyApplicationCount(
                week=f"Week {week}",
                applications=count
            )
        )

    if not weeks:

        recommendation = (
            "Start submitting applications consistently to receive weekly insights."
        )

    elif len(weeks) < 2:

        recommendation = (
            "Keep applying regularly to build enough history for consistency analysis."
        )

    else:

        counts = [week.applications for week in weeks]

        maximum = max(counts)
        minimum = min(counts)

        if maximum - minimum <= 2:

            recommendation = (
                "You maintain a consistent weekly application schedule. "
                "Consistency improves your chances of finding opportunities."
            )

        else:

            recommendation = (
                "Your applications are submitted in bursts rather than "
                "consistently. Try setting a weekly application goal."
            )

    return WeeklyConsistencyAnalysis(
        weeks=weeks,
        recommendation=recommendation
    )