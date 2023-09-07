let client_id;
let secret_key;
let isMerchantUS;
const CONST_US_MERCHANT_ACCT_ID = "CMHAMMNAXCMGA";
const CONST_JP_MERCHANT_ACCT_ID = "HW88JCHBLPBU6";

let checkBoxes=document.getElementsByClassName("form-check-input");


for (let index = 0; index < checkBoxes.length; index++) {
    const element = checkBoxes[index];
    // element.addEventListener()
}

function getOrderObj(isAddressSet = false) {
    console.log(isMerchantUS);
    let total_value = Math.floor(Math.random() * 100);
    let currencyCode = "USD";
    const orderObj = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: currencyCode,
                    value: total_value,
                },
                payee: {
                    merchant_id: isMerchantUS
                        ? CONST_US_MERCHANT_ACCT_ID
                        : CONST_JP_MERCHANT_ACCT_ID,
                },
            },
        ],
    };

    console.log(orderObj);
    return orderObj;
}

function createOrder(isAddressSet = false) {
    const credentials = btoa(`${client_id}:${secret_key}`);
    return fetch("https://api.sandbox.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
            "PayPal-Partner-Attribution-Id": "Test-Venmo",
            "PayPal-Request-Id": self.crypto.randomUUID(),
        },
        body: JSON.stringify(getOrderObj(isAddressSet)),
    })
        .then((res) => res.json())
        .then((orderData) => {
            const orderId = orderData.id;
            console.log(
                `%c 创建的订单号: ${orderId}`,
                "color:agua;font-size:20x;font-weight:bold;text-decoration:underline;"
            );
            return orderId;
        });
}

function getBaseObject(isAddressSet = false) {
    const baseObject = {
        createOrder: createOrder.bind(this, isAddressSet),

        //使用actions.order这个方法是让Paypal服务器生成订单的
        onApprove: function (data, actions) {
            debugger;
            // This function captures the funds from the transaction.

            return actions.order.capture().then(function (details) {
                // debugger;
                alert(
                    "Transaction completed by " + details.payer.name.given_name
                );
            });
        },

        onCancel: function (data) {
            // window.location.href = "onCancel.html";
            // Show a cancel page, or return to cart
        },
    };

    return baseObject;
}

function destroyBtn() {
    $("#paypal-button-container").empty();
}

//Show button[示例的显示credit cards选项]
function showPaypalBtns() {
    console.log("手动加载Buttons!");
    destroyBtn();
    // Loop over each funding source/payment method

    const fundingSource = paypal.FUNDING;
    // console.table(fundingSource);

    //paypal.getFundingSources() 这个方法在2023-08-08的测试中发现不可用了
    // console.log(
    //     `%c 当前的funding-source: ${fundingSource}`,
    //     "color:orange;font-size:20x;font-weight:bold;text-decoration:underline;"
    // );

    const FUNDING_SOURCES = [
        paypal.FUNDING.PAYPAL,
        paypal.FUNDING.PAYLATER,
        paypal.FUNDING.VENMO,
    ];

    FUNDING_SOURCES.forEach(function (fundingSource) {
        // Initialize the buttons
        let button = paypal.Buttons({
            fundingSource: fundingSource,
            ...getBaseObject(),
        });
        // Check if the button is eligible
        if (button.isEligible()) {
            // Render the standalone button for that funding source
            button.render("#paypal-button-container");
        }
    });
}

function renderSPBAutomatically() {
    console.log("自动加载Buttons!");
    destroyBtn();
    paypal
        .Buttons({
            ...getBaseObject(),
        })
        .render("#paypal-button-container");
}

let upLoadClickTag = 0;

function renderSPB() {
    console.clear();
     if (upLoadClickTag == 0) {
        upLoadClickTag = 1;
        setBTNStates();

        //1.5秒过后可以再次点击
        setTimeout(function () {
            upLoadClickTag = 0;
            setBTNStates();
        }, 1500);
    } else {
        alert("请勿频繁操作！");
        return;
    }

    let isAuto = document.getElementById("cb-use-auto").checked;
    let isUSAcct = document.getElementById("cb-use-us-acct").checked;
    let isVenmo = document.getElementById("cb-use-venmo").checked;
    let isUSBuyer = document.getElementById("cb-us-buyer").checked;
    isMerchantUS = document.getElementById("cb-us-seller").checked;
    let isMerchantIDAttached = document.getElementById(
        "cb-is-merchant-id-attached"
    ).checked;

    // let textArea = document.getElementById("textBox");
    // textArea.style.visibility = "visible";
    // debugger;

    let toPrint = {
         "isAuto:": isAuto ,
         "isUSAcct:": isUSAcct ,
         "isVenmo:": isVenmo ,
         "isUSBuyer:": isUSBuyer ,
         "isMerchantUS": isMerchantUS ,
        "isMerchantIDAttached:": isMerchantIDAttached
    };
    console.table(toPrint);

    // isUSAcct ? setUSClient() : setHKClient();
    isUSAcct ? setUSClient() : setChinaClient();

    let script = document.createElement("script");
    script.type = "text/javascript";
    let url = `https://www.paypal.com/sdk/js?client-id=${client_id}`;
    if (isVenmo) url = `${url}&enable-funding=venmo`;
    if (isUSBuyer) url = `${url}&buyer-country=US`;
    if (isMerchantIDAttached)
        url = `${url}&merchant-id=${
            isMerchantUS ? CONST_US_MERCHANT_ACCT_ID : CONST_JP_MERCHANT_ACCT_ID
        } `;
    console.log(url);
    script.src = url;
    script.onload = function () {
        console.log("PayPal js SDK loaded!");
        isAuto ? renderSPBAutomatically() : showPaypalBtns();
    };

    document.head.appendChild(script);
}

function setUSClient() {
    client_id =
        "AbZ4SgDEKTPsZXrP6qLGxY45lzHwEoAFtaDH4A44jAvH4-NdUJmPNuFx57zIVa1ErJR9_js4GBFMOWH9";
    secret_key =
        "EFKoo6nQnyiJHqny3C7A1-uI_YDH1goJzv0JnaICHz9S0qRzs0rC9J9kz3qS1bQa42-s7tLIEkli_JhY";
}

function setHKClient() {
    client_id =
        "AZPbZEuhYFRy0VOpNItu4jPX8yU1jPFG6YE88hP9OWffEXt8VT-AOpOqqWbu5xmsaBi4KMT2OMXg59Yb";
    secret_key =
        "EFlYtmk8ANXyLWCkgvUiO2uKX5M-inwLAiblGZf0IEpeIuZYENSJRlP5fH2uHTVi83OhqLCFfEvDspfL";
}

function setChinaClient(){
    client_id =
        "AUM2zJb7drPiUy5Vby3gnWhQghznD59atjgWuh2yhUIbGYbuxpSVfZqwgHJx9lbeoxqiklXs0sdm_HW7";
    secret_key =
        "EOEczaB4H2gKrghoM5J5IOh_zUkxKSzftSuEaez10oa6l3CuQZ3Q396PtT0OklIPD0KyttJZknBLcL7K";
}

function setBTNStates() {
    let btn = document.getElementById("render-btn");
    btn.disabled = !btn.disabled;
    let span = btn.children[0];
    // span.style.visibility = span.style.visibility == "visible"? "hidden" : "visible"
    span.style.display = span.style.display == "" ? "none" : "";
}
