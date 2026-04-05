// cat > backend/src/services/emailService.js << 'EOF'
import nodemailer from 'nodemailer';
import config from '../config/environment.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendOTP(email, otp, type) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333;">Employee Management System</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #666; font-size: 16px;">Your OTP for <strong>${type}</strong> is:</p>
          
          <div style="background-color: #007bff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: white; margin: 0; font-size: 32px;">${otp}</h1>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Valid for ${config.otp.expiry} minutes only
          </p>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p>This is an automated message, please don't reply to this email.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: `OTP for ${type} - Employee Management System`,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }

  async sendLeaveNotification(email, leave, status) {
    let statusMessage = '';
    let statusColor = '';

    if (status === 'SUBMITTED') {
      statusMessage = 'Your leave application has been submitted successfully.';
      statusColor = '#FFA500';
    } else if (status === 'APPROVED') {
      statusMessage = 'Your leave application has been approved!';
      statusColor = '#28A745';
    } else if (status === 'REJECTED') {
      statusMessage = 'Your leave application has been rejected.';
      statusColor = '#DC3545';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333;">Leave Application Update</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #666; font-size: 16px;">${statusMessage}</p>
          
          <div style="background-color: ${statusColor}; padding: 20px; border-radius: 5px; margin: 20px 0; color: white;">
            <div style="margin-bottom: 10px;"><strong>Leave Type:</strong> ${leave.leaveType}</div>
            <div style="margin-bottom: 10px;"><strong>From:</strong> ${new Date(leave.startDate).toLocaleDateString()}</div>
            <div style="margin-bottom: 10px;"><strong>To:</strong> ${new Date(leave.endDate).toLocaleDateString()}</div>
            <div><strong>Days:</strong> ${leave.numberOfDays}</div>
          </div>
          
          ${leave.rejectionReason ? `
            <div style="background-color: #ffe6e6; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;">
              <strong style="color: #dc3545;">Rejection Reason:</strong>
              <p style="color: #666; margin: 10px 0 0 0;">${leave.rejectionReason}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated message from Employee Management System.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: `Leave Application ${status} - Employee Management System`,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333;">Welcome to Employee Management System</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #666; font-size: 16px;">Hello <strong>${firstName}</strong>,</p>
          
          <p style="color: #666; font-size: 16px; margin: 20px 0;">
            Welcome to our Employee Management System! Your account has been successfully created.
          </p>
          
          <p style="color: #666; font-size: 16px; margin: 20px 0;">
            You can now:
          </p>
          
          <ul style="color: #666; font-size: 16px;">
            <li>View your attendance records</li>
            <li>Apply for leave</li>
            <li>Check your payroll information</li>
            <li>Update your profile</li>
          </ul>
          
          <div style="background-color: #007bff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <a href="http://localhost:5173/dashboard" style="color: white; text-decoration: none; font-weight: bold; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
          <p>If you have any questions, please contact your HR department.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Welcome to Employee Management System',
        html,
      });
      return true;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }

  async sendAttendanceReport(email, employeeName, attendanceData) {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333;">Attendance Report</h2>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #666; font-size: 16px;">Hello ${employeeName},</p>
          
          <p style="color: #666; font-size: 16px; margin: 20px 0;">
            Here is your attendance summary for the month:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #007bff;">
              <th style="padding: 10px; color: white; text-align: left; border: 1px solid #ddd;">Status</th>
              <th style="padding: 10px; color: white; text-align: left; border: 1px solid #ddd;">Count</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Present</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: green; font-weight: bold;">${attendanceData.present || 0}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 10px; border: 1px solid #ddd;">Absent</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: red; font-weight: bold;">${attendanceData.absent || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Leave</td>
              <td style="padding: 10px; border: 1px solid #ddd; color: blue; font-weight: bold;">${attendanceData.leave || 0}</td>
            </tr>
          </table>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
          <p>For more details, please login to your account.</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: email,
        subject: 'Your Monthly Attendance Report',
        html,
      });
      return true;
    } catch (error) {
      console.error('Email error:', error);
      throw error;
    }
  }
}

export default new EmailService();
// EOF