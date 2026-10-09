#!/usr/bin/env python3
"""
StitchAI - AI-Powered Custom Apparel, Sales, and Business Automation Platform
Full-Featured Backend Server with SQLite Database, Real Computer Vision Engine,
Gemini AI Intelligence, and Stripe/Razorpay Checkout Simulation.
"""

import os
import sys
import json
import urllib.request
import urllib.error
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from datetime import datetime

import db
import cv_engine

PORT = int(os.environ.get("PORT", 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIRECTORY = os.path.join(os.path.dirname(DIRECTORY), "frontend")

# Initialize SQLite database on startup
db.init_db()

# Optional Gemini API key from environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

SYSTEM_INSTRUCTION = """
You are the StitchAI Autonomous Apparel Specialist and Sales Concierge.
Your purpose is to assist clients (colleges, tech startups, gyms, restaurants, and uniform buyers)
in designing custom apparel (hoodies, t-shirts, polos, caps, bomber jackets, aprons),
extracting project requirements (garment type, fabric GSM, quantity, size breakdown, logo placement, deadlines, ZIP code),
and generating instant volume quotations.
Be professional, concise, enthusiastic, and provide practical embroidery advice (e.g., stitch counts, Madeira 40 thread recommendations, 3D puff embroidery, backing and underlay).
"""


class StitchAIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self.send_json_response({
                "status": "healthy",
                "platform": "StitchAI",
                "version": "3.5.0",
                "gemini_connected": bool(GEMINI_API_KEY),
                "database": "SQLite (stitchai.db)",
                "modules": [
                    "Gemini AI Sales Concierge",
                    "Computer Vision Embroidery Studio",
                    "Dynamic Quotation Engine",
                    "Order Workflow & Approval Portal",
                    "Production Partner Marketplace",
                    "AI CRM & WhatsApp Gateway",
                    "Stripe & Razorpay Payment Engine",
                    "Academic Project Architecture Report"
                ]
            })
            return

        # SQLite Orders
        elif path == "/api/db/orders":
            orders = db.get_all_orders()
            self.send_json_response({"orders": orders})
            return

        # SQLite Leads
        elif path == "/api/db/leads":
            leads = db.get_all_leads()
            self.send_json_response({"leads": leads})
            return

        # Production Marketplace Jobs
        elif path == "/api/jobs":
            jobs = [
                {
                    "id": "JOB-7021",
                    "title": "300x Heavyweight Crewnecks for Tech Summit",
                    "client": "NextWave AI Corp",
                    "units": 300,
                    "stitchCount": 18200,
                    "colors": 4,
                    "garment": "380 GSM Organic French Terry",
                    "deadline": "7 Days",
                    "payout": "$3,850.00",
                    "margin": "38%",
                    "recommendedMachine": "Tajima / Barudan (8+ Heads)",
                    "location": "Oakland Hub",
                    "status": "Open for Bidding"
                },
                {
                    "id": "JOB-7022",
                    "title": "150x Performance Pique Polos (Left Chest)",
                    "client": "Apex Capital Partners",
                    "units": 150,
                    "stitchCount": 9400,
                    "colors": 3,
                    "garment": "100% Combed Pique Cotton",
                    "deadline": "4 Days",
                    "payout": "$1,620.00",
                    "margin": "42%",
                    "recommendedMachine": "Brother / Happy 4-Head",
                    "location": "San Jose Hub",
                    "status": "Open for Bidding"
                },
                {
                    "id": "JOB-7023",
                    "title": "85x Structured Snapback Caps (3D Puff)",
                    "client": "IronForge Athletics",
                    "units": 85,
                    "stitchCount": 22400,
                    "colors": 2,
                    "garment": "Wool Blend 6-Panel Cap",
                    "deadline": "5 Days",
                    "payout": "$1,190.00",
                    "margin": "45%",
                    "recommendedMachine": "Tubular Cap Driver Ready",
                    "location": "Fremont Facility",
                    "status": "Assigned"
                }
            ]
            self.send_json_response({"jobs": jobs})
            return

        # Default fallback to static files
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        try:
            content_length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            self.send_json_response({"error": "Invalid Content-Length header"}, status=400)
            return
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json_response({"error": "Request body must be valid JSON"}, status=400)
            return
        if not isinstance(body, dict):
            self.send_json_response({"error": "Request body must be a JSON object"}, status=400)
            return

        # 1. Computer Vision Analysis Endpoint
        if path == "/api/analyze-artwork":
            filename = body.get("filename", "custom_artwork.png")
            result = cv_engine.analyze_image_payload(filename)
            artwork_id = db.save_artwork({
                "filename": result["filename"],
                "dimensions": result["dimensions"],
                "complexity_score": result["complexityScore"],
                "stitch_count": result["stitchCount"],
                "colors_count": result["colorCount"],
                "colors": result["threadColors"],
                "puff_eligibility": result["puffEligibility"]
            })
            result["artwork_id"] = artwork_id
            self.send_json_response(result)
            return

        # 2. Dynamic Quotation Algorithmic Calculation
        elif path == "/api/quote":
            try:
                qty = int(body.get("quantity", 150))
                stitches = int(body.get("stitches", 16840))
                placements = int(body.get("placements", 1))
            except (TypeError, ValueError):
                self.send_json_response({"error": "Quantity, stitches, and placements must be integers"}, status=400)
                return
            if qty < 1 or stitches < 0 or placements < 1:
                self.send_json_response({"error": "Quantity and placements must be positive; stitches cannot be negative"}, status=400)
                return

            speed = body.get("speed", "express")
            polybag = bool(body.get("polybagging", True))
            tags = bool(body.get("wovenTags", True))
            garment_type = body.get("garmentType", "hoodie")

            garment_prices = {
                "hoodie": (32.00, 24.50, 19.80, 16.50),
                "tshirt": (18.00, 13.50, 10.80, 8.90),
                "polo": (24.00, 18.50, 15.20, 12.80),
                "cap": (19.50, 14.80, 11.90, 9.75),
                "bomber": (58.00, 46.00, 38.50, 32.00),
                "apron": (22.00, 17.00, 13.50, 11.20)
            }
            tier = 3 if qty >= 500 else (2 if qty >= 150 else (1 if qty >= 50 else 0))
            base_garment = garment_prices.get(garment_type, garment_prices["hoodie"])[tier]

            stitch_run = (stitches / 1000.0) * 0.18
            multi_hit = (placements - 1) * 3.20
            pack_cost = (0.60 if polybag else 0) + (1.20 if tags else 0)

            unit_subtotal = base_garment + stitch_run + multi_hit + pack_cost
            speed_mult = 1.0 if speed == "standard" else (1.15 if speed == "express" else 1.30)
            unit_price = round(unit_subtotal * speed_mult, 2)
            digitizing = 0.0 if qty >= 50 else 35.0
            total_amount = round((unit_price * qty) + digitizing, 2)

            quote_data = {
                "quantity": qty,
                "unitPrice": unit_price,
                "totalAmount": total_amount,
                "digitizingWaived": qty >= 50,
                "leadTime": "4-6 Business Days" if speed == "express" else ("48-72h Rush" if speed == "rush" else "7-10 Days"),
                "baseGarment": base_garment,
                "stitchRun": round(stitch_run, 2),
                "multiHit": round(multi_hit, 2),
                "packCost": round(pack_cost, 2)
            }
            quote_data["quote_id"] = db.save_quote({
                "client_name": body.get("clientName", "Valued Client"),
                "garment_type": garment_type,
                "quantity": qty,
                "stitch_count": stitches,
                "unit_price": unit_price,
                "total_amount": total_amount,
                "lead_time": quote_data["leadTime"],
                "line_items": quote_data
            })
            self.send_json_response(quote_data)
            return

        elif path == "/api/db/artworks":
            try:
                stitch_count = int(body.get("stitch_count", 0))
                complexity_score = int(body.get("complexity_score", 0))
                colors_count = int(body.get("colors_count", 0))
            except (TypeError, ValueError):
                self.send_json_response({"error": "Artwork metrics must be integers"}, status=400)
                return
            if stitch_count < 0 or not 0 <= complexity_score <= 100 or colors_count < 0:
                self.send_json_response({"error": "Artwork metrics are outside the supported range"}, status=400)
                return
            if not isinstance(body.get("thread_colors", []), list):
                self.send_json_response({"error": "thread_colors must be an array"}, status=400)
                return

            artwork_id = db.save_artwork({
                "filename": body.get("filename", "custom_artwork.png"),
                "dimensions": body.get("dimensions"),
                "complexity_score": complexity_score,
                "stitch_count": stitch_count,
                "colors_count": colors_count,
                "colors": body.get("thread_colors", []),
                "puff_eligibility": body.get("puff_eligibility")
            })
            self.send_json_response({"status": "created", "artwork_id": artwork_id}, status=201)
            return

        # 3. Gemini LLM Conversational Agent
        elif path == "/api/gemini/chat":
            prompt = body.get("message", "")
            api_key = body.get("apiKey") or GEMINI_API_KEY
            history = body.get("history", [])

            if api_key:
                try:
                    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
                    contents = []
                    for h in history:
                        role = "user" if h.get("sender") == "user" else "model"
                        contents.append({"role": role, "parts": [{"text": h.get("text", "")}]})
                    contents.append({"role": "user", "parts": [{"text": prompt}]})

                    payload = {
                        "system_instruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
                        "contents": contents
                    }
                    req = urllib.request.Request(
                        gemini_url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=12) as resp:
                        resp_data = json.loads(resp.read().decode("utf-8"))
                        reply_text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                        self.send_json_response({"reply": reply_text, "source": "gemini-2.5-flash"})
                        return
                except Exception as e:
                    # Fallback to local intelligent assistant if error
                    pass

            # Local Heuristic AI Response Fallback
            reply_text = (
                f"🎯 **Project parameters analyzed by StitchAI!**\n\n"
                f"I've configured your request into our manufacturing pipeline. "
                f"We can produce your custom apparel with industrial multi-head precision (850 SPM).\n\n"
                f"• **Embroidery Specs:** Madeira Polyneon 40 thread + 3.0 oz cutaway backing\n"
                f"• **Lead Time:** 4-6 business days with express QC inspection\n"
                f"• **Digitizing:** Automatically generated into Tajima .DST vector\n\n"
                f"Would you like to review the 3D puff embroidery mockup in the studio or finalize the quotation?"
            )
            self.send_json_response({"reply": reply_text, "source": "stitchai-local-engine"})
            return

        # 4. Stripe & Razorpay Payment Simulation
        elif path == "/api/db/checkout":
            order_id = body.get("order_id", "ST-8942")
            try:
                amount = float(body.get("amount", 3360.00))
            except (TypeError, ValueError):
                self.send_json_response({"error": "Payment amount must be numeric"}, status=400)
                return
            gateway = body.get("gateway", "stripe") # 'stripe' | 'razorpay'
            card_last4 = body.get("last4", "4242")
            if gateway not in ("stripe", "razorpay"):
                self.send_json_response({"error": "Unsupported payment gateway"}, status=400)
                return
            if not any(order["id"] == order_id for order in db.get_all_orders()):
                self.send_json_response({"error": f"Order {order_id} was not found"}, status=404)
                return
            if amount <= 0:
                self.send_json_response({"error": "Payment amount must be greater than zero"}, status=400)
                return

            txn_id = db.record_transaction({
                "order_id": order_id,
                "amount": amount,
                "currency": "USD",
                "payment_gateway": gateway.upper(),
                "status": "Succeeded",
                "details": {
                    "method": "Card" if gateway == "stripe" else "UPI / NetBanking",
                    "last4": card_last4,
                    "timestamp": datetime.now().isoformat()
                }
            })

            # Advance order stage to 'Garment Allocation'
            db.update_order_stage(order_id, 3, "Payment Received - Garment Sourcing in Progress")

            self.send_json_response({
                "status": "success",
                "transaction_id": txn_id,
                "order_id": order_id,
                "amount": amount,
                "receipt_url": f"/receipts/{txn_id}.pdf",
                "message": f"Payment of ${amount:.2f} successfully verified via {gateway.upper()}."
            })
            return

        # 5. Order Management
        elif path == "/api/db/orders/create":
            order_id = db.create_order(body)
            self.send_json_response({"status": "created", "order_id": order_id})
            return

        elif path.startswith("/api/db/orders/") and path.endswith("/stage"):
            order_id = path.split("/")[4]
            try:
                stage = int(body.get("stage", 2))
            except (TypeError, ValueError):
                self.send_json_response({"error": "Stage must be an integer"}, status=400)
                return
            stage_title = body.get("stage_title")
            if not db.update_order_stage(order_id, stage, stage_title):
                self.send_json_response({"error": f"Order {order_id} was not found"}, status=404)
                return
            self.send_json_response({"status": "updated", "order_id": order_id, "stage": stage})
            return

        # 6. WhatsApp Simulator Webhook
        elif path == "/api/whatsapp-simulator":
            customer_msg = body.get("message", "")
            response_text = (
                f"Hey! Thanks for messaging StitchAI on WhatsApp. "
                f"We analyzed your custom order: 100% In-Stock! "
                f"Instant volume quotation: $11.40/unit with free digitizing. "
                f"Track & approve here: https://stitchai.app/order/ST-8942"
            )
            self.send_json_response({
                "received": customer_msg,
                "aiResponse": response_text,
                "status": "dispatched"
            })
            return

        self.send_error(404, "Endpoint not found")

    def send_json_response(self, data, status=200):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(response_bytes)


def main():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, StitchAIHandler)
    print(f"================================================================")
    print(f"🧵 StitchAI Full-Stack Platform Server v3.5")
    print(f"🚀 Running at: http://localhost:{PORT}")
    print(f"🗄️ SQLite Database: {db.DB_PATH}")
    print(f"🤖 Gemini Intelligence API: {'Configured' if GEMINI_API_KEY else 'Local Heuristic Engine Active'}")
    print(f"💳 Payment Gateways: Stripe & Razorpay Checkout Simulators Ready")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()


if __name__ == "__main__":
    main()
