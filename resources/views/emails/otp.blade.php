// resources/views/emails/otp.blade.php
<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .otp-box {
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Your OTP Code</h2>
        <p>Use this code to verify your account:</p>
        <div class="otp-box">{{ $otp }}</div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
    </div>
</body>

</html>