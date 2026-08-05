// Form validation logic (email, phone, required fields, date).
export function useFormValidation() {
  const validateForm = (formData) => {
    const errors = {}

    // Required Field validation
    if(!formData.firstName?.trim()) {
      errors.firstName = "Require a Firstname"
    }
    if(!formData.lastName?.trim()) {
      errors.firstName = "Require a Lastname"
    }
    if(!formData.dateOfBirth) {
      errors.firstName = "Require Date of birth"
    }
    if(!formData.gender) {
      errors.firstName = "Require a Gender"
    }
    if(!formData.address?.trim()) {
      errors.firstName = "Require an Address"
    }
    if(!formData.preferredLanguage) {
      errors.firstName = "Require a Preferred Language"
    }
    if(!formData.nationally) {
      errors.firstName = "Require a Nationallity"
    }

    // Email validation
    if(!formData.email?.trim()) {
      errors.email = "Required Email"
    } else{
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if(!emailRegex.test(formData.email)) {
        errors.email = "Please provide a valid email"
      }
    }

    // Tel. validation
    if(!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "Required Phone Number"
    } else {
      const digits = formData.phoneNumber.replace(/\D/g,"")
      if (digits.length < 10) {
        errors.phoneNumber = "Phone number must be at least 10 digits"
      }
    }

    // Emergeny contact validation
    if(formData.eContactName?.trim() && !formData.eContactRelationship?.trim()) {
      errors.eContactRelationship = "Please specify the relationship of Emergency contact"
    }

    return errors
  }

  return {
    validateForm
  }
}
