from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def compute_emi(principal: float, annual_rate: float, tenure_years: int):
    """Compute EMI, totals, and a yearly amortization summary."""
    months = tenure_years * 12
    monthly_rate = annual_rate / 12 / 100

    if monthly_rate == 0:
        emi = principal / months
    else:
        factor = (1 + monthly_rate) ** months
        emi = principal * monthly_rate * factor / (factor - 1)

    balance = principal
    yearly = []
    year_principal = 0.0
    year_interest = 0.0

    for month in range(1, months + 1):
        interest_component = balance * monthly_rate
        principal_component = emi - interest_component
        balance -= principal_component
        balance = max(balance, 0)

        year_principal += principal_component
        year_interest += interest_component

        if month % 12 == 0 or month == months:
            yearly.append({
                "year": (month - 1) // 12 + 1,
                "principal": round(year_principal, 2),
                "interest": round(year_interest, 2),
                "balance": round(balance, 2),
            })
            year_principal = 0.0
            year_interest = 0.0

    total_payment = emi * months
    total_interest = total_payment - principal

    return {
        "emi": round(emi, 2),
        "total_payment": round(total_payment, 2),
        "total_interest": round(total_interest, 2),
        "principal": round(principal, 2),
        "schedule": yearly,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json(force=True)
    try:
        principal = float(data.get("principal", 0))
        rate = float(data.get("rate", 0))
        tenure = int(data.get("tenure", 0))
        if principal <= 0 or rate < 0 or tenure <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input"}), 400

    return jsonify(compute_emi(principal, rate, tenure))


@app.route("/healthz")
def healthz():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
