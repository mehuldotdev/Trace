import { insforge } from "@/lib/insforge-client";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from 'ua-parser-js'


const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    })
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            type,
            domain,
            siteId,
            sessionId,
            userAgent,
            visitorId,
            url,
            referrer,
            screenWidth,
            timestamp,
            active_time,
            utm_source,
            utm_campaign
        } = body;

        if (!type || (!domain && !siteId) || !sessionId) {
            return NextResponse.json(
                { error: "Invalid payload" },
                {
                    status: 400,
                    headers: corsHeaders
                }
            )
        }

        const { data: website } = await insforge.database
            .from("websites")
            .select("id, domain, site_id")
            .eq("domain", domain)
            .eq("site_id", siteId)
            .single()

        if (!website) {
            return NextResponse.json(
                { error: "Website not found" },
                {
                    status: 404,
                    headers: corsHeaders
                }
            )
        }

        const websiteId = website.id
        const parser = new UAParser(userAgent || "");
        const ua = parser.getResult();

        const browser = ua.browser.name || "";
        const os = ua.os.name || ""

        let device_size = "Desktop"
        if (ua.device.type === "mobile") device_size = "Mobile"
        else if (ua.device.type === "tablet") device_size = "Tablet"
        else if (screenWidth && screenWidth < 1280) device_size = "Laptop"

        const ip = req.headers.get("x-forwarded-for")
            ?.split(",")?.[0] || req.headers.get("x-real-ip")

        let country = ""
        let countryCode = ""
        let region = ""
        let city = ""

        if (ip) {
            try {
                const response = await fetch(`https://ip-api.com/json/${ip}`)
                const geo_res = await response.json();
                if (geo_res.status === "success") {
                    country = geo_res.country;
                    countryCode = geo_res.countryCode
                    region = geo_res.region;
                    city = geo_res.city;
                }
            } catch (error) {
                // Geolocation fetch failed silently
            }
        }

        // Current timestamp
        const now = new Date(timestamp || Date.now()).toISOString()
        //   region,
        //   city,
        //   active_time,
        // })


        if (type === "page_view") {
            const session = await insforge.database
                .from("sessions")
                .select("id")
                .eq("session_id", sessionId)
                .single();

            if (!session.data) {
                await insforge.database
                    .from("sessions")
                    .insert({
                        website_id: websiteId,
                        visitor_id: visitorId,
                        session_id: sessionId,
                        entry_page: url,
                        entry_time: now,
                        last_heartbeat_at: now,
                        referrer,
                        utm_source,
                        utm_campaign,
                        device_size,
                        os,
                        browser,
                        country,
                        country_code: countryCode,
                        region,
                        city,
                    })
            } else {
                await insforge.database.from("sessions")
                    .update({
                        last_heartbeat_at: now
                    }).eq("session_id", sessionId)
            }
        }

        if (type === "heartbeat") {
            await insforge.database.from("sessions")
                .update({
                    last_heartbeat_at: now
                }).eq("session_id", sessionId)
        }

        if (type === "page_exit") {
            await insforge.database.from("sessions")
                .update({
                    exit_page: url,
                    exit_time: now,
                    active_time,
                }).eq("session_id", sessionId)
        }

        return NextResponse.json(
            { success: true },
            {
                headers: corsHeaders
            }
        )

    } catch (error) {

        return NextResponse.json(
            { error: true },
            {
                status: 500,
                headers: corsHeaders
            }
        )
    }
}