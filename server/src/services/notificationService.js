// Notification Service Abstraction
// This provides a clean interface for sending notifications
// with support for multiple providers

class NotificationService {
  constructor() {
    this.provider = this.getProvider()
  }

  getProvider() {
    const providerType = process.env.NOTIFICATION_PROVIDER || 'console'

    switch (providerType) {
      case 'resend':
        return new ResendProvider()
      case 'brevo':
        return new BrevoProvider()
      case 'alpha-sms':
        return new AlphaSMSProvider()
      case 'bulk-sms-bd':
        return new BulkSMSBDProvider()
      case 'console':
      default:
        return new ConsoleProvider()
    }
  }

  async sendAppointmentConfirmation(appointment, language = 'en') {
    return this.provider.sendAppointmentConfirmation(appointment, language)
  }

  async sendAppointmentCancellation(appointment, language = 'en') {
    return this.provider.sendAppointmentCancellation(appointment, language)
  }
}

// Base Provider Class
class BaseProvider {
  async sendAppointmentConfirmation(appointment, language) {
    throw new Error('sendAppointmentConfirmation must be implemented')
  }

  async sendAppointmentCancellation(appointment, language) {
    throw new Error('sendAppointmentCancellation must be implemented')
  }
}

// Console Provider (for development/testing)
class ConsoleProvider extends BaseProvider {
  async sendAppointmentConfirmation(appointment, language) {
    console.log('=== APPOINTMENT CONFIRMATION ===')
    console.log('To:', appointment.phone)
    console.log('Language:', language)
    console.log('Appointment Details:', {
      name: appointment.name,
      date: appointment.date,
      time: appointment.time,
      subject: appointment.subject
    })
    console.log('================================')
    return { success: true, provider: 'console' }
  }

  async sendAppointmentCancellation(appointment, language) {
    console.log('=== APPOINTMENT CANCELLATION ===')
    console.log('To:', appointment.phone)
    console.log('Language:', language)
    console.log('Appointment Details:', {
      name: appointment.name,
      date: appointment.date,
      time: appointment.time
    })
    console.log('==================================')
    return { success: true, provider: 'console' }
  }
}

// Resend Provider (Email)
class ResendProvider extends BaseProvider {
  async sendAppointmentConfirmation(appointment, language) {
    // TODO: Implement Resend API integration
    // Requires: RESEND_API_KEY environment variable
    console.log('Resend provider not yet configured. Add RESEND_API_KEY to environment.')
    return { success: false, provider: 'resend', error: 'Not configured' }
  }

  async sendAppointmentCancellation(appointment, language) {
    // TODO: Implement Resend API integration
    console.log('Resend provider not yet configured. Add RESEND_API_KEY to environment.')
    return { success: false, provider: 'resend', error: 'Not configured' }
  }
}

// Brevo Provider (Email + SMS)
class BrevoProvider extends BaseProvider {
  async sendAppointmentConfirmation(appointment, language) {
    // TODO: Implement Brevo API integration
    // Requires: BREVO_API_KEY environment variable
    console.log('Brevo provider not yet configured. Add BREVO_API_KEY to environment.')
    return { success: false, provider: 'brevo', error: 'Not configured' }
  }

  async sendAppointmentCancellation(appointment, language) {
    // TODO: Implement Brevo API integration
    console.log('Brevo provider not yet configured. Add BREVO_API_KEY to environment.')
    return { success: false, provider: 'brevo', error: 'Not configured' }
  }
}

// Alpha SMS Provider
class AlphaSMSProvider extends BaseProvider {
  async sendAppointmentConfirmation(appointment, language) {
    // TODO: Implement Alpha SMS API integration
    // Requires: ALPHA_SMS_API_KEY environment variable
    console.log('Alpha SMS provider not yet configured. Add ALPHA_SMS_API_KEY to environment.')
    return { success: false, provider: 'alpha-sms', error: 'Not configured' }
  }

  async sendAppointmentCancellation(appointment, language) {
    // TODO: Implement Alpha SMS API integration
    console.log('Alpha SMS provider not yet configured. Add ALPHA_SMS_API_KEY to environment.')
    return { success: false, provider: 'alpha-sms', error: 'Not configured' }
  }
}

// Bulk SMS BD Provider
class BulkSMSBDProvider extends BaseProvider {
  async sendAppointmentConfirmation(appointment, language) {
    // TODO: Implement Bulk SMS BD API integration
    // Requires: BULK_SMS_BD_API_KEY environment variable
    console.log('Bulk SMS BD provider not yet configured. Add BULK_SMS_BD_API_KEY to environment.')
    return { success: false, provider: 'bulk-sms-bd', error: 'Not configured' }
  }

  async sendAppointmentCancellation(appointment, language) {
    // TODO: Implement Bulk SMS BD API integration
    console.log('Bulk SMS BD provider not yet configured. Add BULK_SMS_BD_API_KEY to environment.')
    return { success: false, provider: 'bulk-sms-bd', error: 'Not configured' }
  }
}

module.exports = NotificationService
