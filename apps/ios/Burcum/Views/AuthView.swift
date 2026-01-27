import SwiftUI

struct AuthView: View {
    @State private var isLogin = true
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var birthDate = Date()
    @State private var showDatePicker = false

    @EnvironmentObject var authManager: AuthManager

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo
                    VStack(spacing: 8) {
                        Text("✨")
                            .font(.system(size: 60))

                        Text("Burcum")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.purple, .pink],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                    }
                    .padding(.top, 40)

                    // Tab Selector
                    HStack(spacing: 0) {
                        TabSelectorButton(title: "Giriş Yap", isSelected: isLogin) {
                            withAnimation { isLogin = true }
                        }
                        TabSelectorButton(title: "Kayıt Ol", isSelected: !isLogin) {
                            withAnimation { isLogin = false }
                        }
                    }
                    .background(Color.white.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)

                    // Form
                    VStack(spacing: 16) {
                        if !isLogin {
                            CustomTextField(
                                icon: "person",
                                placeholder: "Ad Soyad",
                                text: $name
                            )

                            // Birth Date
                            Button {
                                showDatePicker = true
                            } label: {
                                HStack {
                                    Image(systemName: "calendar")
                                        .foregroundColor(.gray)
                                    Text(birthDate.formatted(date: .long, time: .omitted))
                                        .foregroundColor(.white)
                                    Spacer()
                                }
                                .padding()
                                .background(Color.white.opacity(0.1))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }

                        CustomTextField(
                            icon: "envelope",
                            placeholder: "E-posta",
                            text: $email,
                            keyboardType: .emailAddress
                        )

                        CustomTextField(
                            icon: "lock",
                            placeholder: "Şifre",
                            text: $password,
                            isSecure: true
                        )

                        // Error
                        if let error = authManager.error {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }

                        // Submit Button
                        Button(action: submit) {
                            HStack {
                                if authManager.isLoading {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Text(isLogin ? "Giriş Yap" : "Kayıt Ol")
                                }
                            }
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(
                                LinearGradient(
                                    colors: [.purple, .indigo],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .disabled(authManager.isLoading || !isFormValid)
                        .opacity(isFormValid ? 1 : 0.5)
                    }
                    .padding(.horizontal)

                    // Social Login (placeholder)
                    VStack(spacing: 16) {
                        Text("veya")
                            .foregroundColor(.gray)

                        Button {
                            // Apple Sign In
                        } label: {
                            HStack {
                                Image(systemName: "apple.logo")
                                Text("Apple ile devam et")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .foregroundColor(.black)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .padding(.horizontal)

                    Spacer()
                }
            }
            .background(
                LinearGradient(
                    colors: [
                        Color(red: 0.1, green: 0.05, blue: 0.2),
                        Color(red: 0.05, green: 0.02, blue: 0.1)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .sheet(isPresented: $showDatePicker) {
                DatePickerSheet(date: $birthDate, isPresented: $showDatePicker)
            }
        }
    }

    private var isFormValid: Bool {
        let emailValid = email.contains("@") && email.contains(".")
        let passwordValid = password.count >= 6

        if isLogin {
            return emailValid && passwordValid
        } else {
            return emailValid && passwordValid && !name.isEmpty
        }
    }

    private func submit() {
        Task {
            if isLogin {
                await authManager.login(email: email, password: password)
            } else {
                await authManager.register(
                    email: email,
                    password: password,
                    name: name.isEmpty ? nil : name,
                    birthDate: birthDate
                )
            }
        }
    }
}

struct TabSelectorButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .fontWeight(.medium)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(isSelected ? Color.purple : .clear)
                .foregroundColor(isSelected ? .white : .gray)
        }
    }
}

struct CustomTextField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var isSecure: Bool = false

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.gray)

            if isSecure {
                SecureField(placeholder, text: $text)
            } else {
                TextField(placeholder, text: $text)
                    .keyboardType(keyboardType)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }
        }
        .padding()
        .background(Color.white.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct DatePickerSheet: View {
    @Binding var date: Date
    @Binding var isPresented: Bool

    var body: some View {
        NavigationStack {
            DatePicker(
                "Doğum Tarihi",
                selection: $date,
                in: ...Date(),
                displayedComponents: .date
            )
            .datePickerStyle(.graphical)
            .padding()
            .navigationTitle("Doğum Tarihi")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Tamam") {
                        isPresented = false
                    }
                }
            }
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthManager())
}
