"use server"

import { getAuthenticatedClient } from "@/lib/insforge-server"
import { formatISO, startOfDay, subDays, endOfDay } from "date-fns";



export async function getAnalytics(
    websiteId: string, from?: Date, to?: Date
) {
    const { insforge, user } = await getAuthenticatedClient()
    if (!user) return { error: "Unauthorized" }

    const startISO = formatISO(startOfDay(from ?? subDays(
        new Date(), 29)));
    const endISO = formatISO(endOfDay(to ?? new Date()));

    const { data: sessions, error } = await insforge.database
        .from("sessions")
        .select("*")
        .eq("website_id", websiteId)
        .gte("entry_time", startISO)
        .lte("entry_time", endISO)

    if (error) return { error: "Failed to fetch analytics" }

    const dailyStats: Record<string, any> = {}
    const allVisitors = new Set<string>()

    let totalPageviews = 0
    let totalActiveMs = 0
    let activeSessionCount = 0
    let bounceCount = 0


    sessions?.forEach((session: any) => {

        const day = session.entry_time.split("T")[0];

        if (!dailyStats[day]) {
            dailyStats[day] = {
                date: day,
                visitorIds: new Set<string>(),
                pageviews: 0,
                activeMs: 0,
                activeCount: 0
            }
        }

        const stats = dailyStats[day];

        // Count each unique visitor
        stats.visitorIds.add(session.visitor_id);
        allVisitors.add(session.visitor_id);

        // Count pageView
        stats.pageviews++;
        totalPageviews++

        if (!session.active_time || session.active_time < 5000) {
            bounceCount++
        }

        //Tract ative time
        if (session.active_time) {
            stats.activeMs += session.active_time;
            stats.activeCount++
            totalActiveMs += session.active_time;
            activeSessionCount++
        }


    })

    const chartData = Object.values(dailyStats)
        .map((dayStat: any) => ({
            date: dayStat.date,
            uniqueVisitors: dayStat.visitorIds.size,
            totalPageviews: dayStat.pageviews,
            averageActiveTime: dayStat.activeCount > 0
                ? Math.round(dayStat.activeMs / dayStat.activeCount / 1000)
                : 0
        }))

    const bounceRate = sessions?.length
        ? Math.round((bounceCount / sessions.length) * 100)
        : 0

    const averageActiveTime = activeSessionCount > 0
        ? Math.round(totalActiveMs / activeSessionCount / 1000)
        : 0


    return {
        chartData,
        metrics: {
            uniqueVisitors: allVisitors.size,
            totalPageviews,
            bounceRate,
            averageActiveTime,
        }
    }

}

export async function getLocationAnalytics(
    websiteId: string, from?: Date, to?: Date
) {
    const { insforge, user } = await getAuthenticatedClient()
    if (!user) return { error: "Unauthorized" }

    const startISO = formatISO(startOfDay(from ?? subDays(
        new Date(), 29)));
    const endISO = formatISO(endOfDay(to ?? new Date()));

    const { data: sessions, error } = await insforge.database
        .from("sessions")
        .select("*")
        .eq("website_id", websiteId)
        .gte("entry_time", startISO)
        .lte("entry_time", endISO)

    if (error) return { error: "Failed to fetch analytics" }

    const countryMap: Record<string, {
        visitors: Set<string>,
        country_code: string
    }> = {}

    sessions?.forEach((session: any) => {
        if (!session.country) return;

        if (!countryMap[session.country]) {
            countryMap[session.country] = {
                visitors: new Set(),
                country_code: session.country_code || ""
            }
        }

        if (!countryMap[session.country].country_code &&
            session.country_code
        ) {
            countryMap[session.country].country_code = session.country_code
        }

        countryMap[session.country].visitors.add(
            session.visitor_id);
    })

    let maxVisitors = 0;
    Object.values(countryMap).forEach((country) => {
        maxVisitors = Math.max(maxVisitors, country.visitors.size)
    })

    const locations = Object.entries(countryMap).map(
        ([country, data]) => ({
            name: country,
            code: data.country_code,
            visitors: data.visitors.size,
            val: maxVisitors > 0
                ? Math.round((data.visitors.size / maxVisitors) * 100)
                : 0
        }))

    return { locations }

}

export async function getDeviceAnalytics(
    websiteId: string, from?: Date, to?: Date
) {
    const { insforge, user } = await getAuthenticatedClient()
    if (!user) return { error: "Unauthorized" }

    const startISO = formatISO(startOfDay(from ?? subDays(
        new Date(), 29)));
    const endISO = formatISO(endOfDay(to ?? new Date()));

    const { data: sessions, error } = await insforge.database
        .from("sessions")
        .select("device_size, browser, os, visitor_id")
        .eq("website_id", websiteId)
        .gte("entry_time", startISO)
        .lte("entry_time", endISO)

    if (error) return { error: "Failed to fetch analytics" }

    const deviceSizeMap: Record<string, Set<string>> = {}
    const browserMap: Record<string, Set<string>> = {}
    const osMap: Record<string, Set<string>> = {}

    sessions?.forEach((s: any) => {
        const device = s.device_size || "Unknown";
        const browser = s.browser || "Unknown";
        const os = s.os || "Unknown";

        if (!deviceSizeMap[device]) deviceSizeMap[device] = new Set()
        deviceSizeMap[device].add(s.visitor_id)


        if (!browserMap[browser]) browserMap[browser] = new Set()
        browserMap[browser].add(s.visitor_id)

        if (!osMap[os]) osMap[os] = new Set()
        osMap[os].add(s.visitor_id)
    })


    const devicesSize = Object.entries(deviceSizeMap)
        .map(([name, visitors]) => ({
            name,
            visitors: visitors.size
        }))
        .sort((a, b) => b.visitors - a.visitors)


    const browsers = Object.entries(browserMap)
        .map(([name, visitors]) => ({
            name,
            visitors: visitors.size
        }))
        .sort((a, b) => b.visitors - a.visitors)

    const operatingSystems = Object.entries(osMap)
        .map(([name, visitors]) => ({
            name,
            visitors: visitors.size
        }))
        .sort((a, b) => b.visitors - a.visitors)



    return {
        devicesSize,
        browsers,
        operatingSystems
    }

}


export async function getSourceAnalytics(
    websiteId: string, from?: Date, to?: Date
) {
    const { insforge, user } = await getAuthenticatedClient()
    if (!user) return { error: "Unauthorized" }

    const startISO = formatISO(startOfDay(from ?? subDays(
        new Date(), 29)));
    const endISO = formatISO(endOfDay(to ?? new Date()));

    const { data: sessions, error } = await insforge.database
        .from("sessions")
        .select("referrer, visitor_id")
        .eq("website_id", websiteId)
        .gte("entry_time", startISO)
        .lte("entry_time", endISO)

    if (error) return { error: "Failed to fetch analytics" }

    const sourceMap: Record<string, Set<string>> = {}

    sessions.forEach((s: any) => {
        let source = "Direct / None";

        if (s.referrer) {
            try {
                source = new URL(s.referrer).hostname.replace("www.", "");
            } catch {
                source = "Direct / None"
            }
        }

        if (!sourceMap[source]) {
            sourceMap[source] = new Set();
        }

        sourceMap[source].add(s.visitor_id)
    })

    const sources = Object.entries(sourceMap).map(([name, visitors]) => ({
        name,
        visitors: visitors.size,
    }))
        .sort((a, b) => b.visitors - a.visitors);

    return { sources }

}

export async function getPageAnalytics(
    websiteId: string, from?: Date, to?: Date
) {
    const { insforge, user } = await getAuthenticatedClient()
    if (!user) return { error: "Unauthorized" }

    const startISO = formatISO(startOfDay(from ?? subDays(
        new Date(), 29)));
    const endISO = formatISO(endOfDay(to ?? new Date()));

    const { data: sessions, error } = await insforge.database
        .from("sessions")
        .select("entry_page, exit_page, visitor_id")
        .eq("website_id", websiteId)
        .gte("entry_time", startISO)
        .lte("entry_time", endISO)

    if (error) return { error: "Failed to fetch analytics" }

    const entryPageMap: Record<string, Set<string>> = {};
    const exitPageMap: Record<string, Set<string>> = {};

    sessions?.forEach((s) => {
        if (s.entry_page) {
            let entryPath = s.entry_page;
            try {
                entryPath = new URL(entryPath).pathname || "/"
            } catch (error) {
                entryPath = "/"
            }

            if (!entryPageMap[entryPath]) {
                entryPageMap[entryPath] = new Set();
            }

            entryPageMap[entryPath].add(s.visitor_id)
        }

        //Exit Page
        if (s.exit_page) {
            let exitPath = s.exit_page;
            try {
                exitPath = new URL(exitPath).pathname || "/"
            } catch (error) {
                exitPath = "/"
            }

            if (!exitPageMap[exitPath]) {
                exitPageMap[exitPath] = new Set();
            }

            exitPageMap[exitPath].add(s.visitor_id)
        }
    })

    const entryPages = Object.entries(entryPageMap)
        .map(([path, visitors]) => ({
            path,
            visitors: visitors.size,
        }))
        .sort((a, b) => b.visitors - a.visitors);

    const exitPages = Object.entries(exitPageMap)
        .map(([path, visitors]) => ({
            path,
            visitors: visitors.size,
        }))
        .sort((a, b) => b.visitors - a.visitors);

    return { entryPages, exitPages };

}


export async function getLiveVisitors(websiteId: string) {
    const { insforge, user } = await getAuthenticatedClient()
    if (!user) return { error: "Unauthorized" }
    const now = Date.now()

    const { data: sessions, error } = await insforge.database
        .from("sessions")
        .select("visitor_id")
        .eq("website_id", websiteId)
        .gte("last_heartbeat_at", new Date(now - 30000).toISOString())

    if (error) return { error: "Failed to fetch data" }

    const uniqueVisitors = new Set(sessions?.map(s => s.visitor_id))
    const liveVisitors = uniqueVisitors.size

    return { liveVisitors }
}