
export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin',
}

export enum ExamType {
    TOEFL = 'TOEFL',
    IELTS = 'IELTS',
    TOEIC = 'TOEIC',
    SAT = 'SAT',
    GRE = 'GRE',
}

export enum ProficiencyLevel {
    BEGINNER = 'Beginner',
    ELEMENTARY = 'Elementary',
    INTERMEDIATE = 'Intermediate',
    UPPER_INTERMEDIATE = 'Upper Intermediate',
    ADVANCED = 'Advanced'
}

export enum SkillEnum {
    SPEAKING = 'speaking',
    LISTENING = 'listening',
    READING = 'reading',
    WRITING = 'writing',
}

export enum QuestionGroupType {
    SINGLE = 'single',                // Câu đơn
    MULTIPLE = 'multiple',            // Chọn nhiều đáp án
    PASSAGE = 'passage',              // Đọc đoạn văn dài
    CONVERSATION = 'conversation',    // Hội thoại
    IMAGE = 'image',                  // Nhìn hình trả lời
    AUDIO = 'audio',                  // Nghe audio
    FILL_IN_BLANK = 'fill_in_blank',  // Điền từ
    MATCHING = 'matching',            // Ghép cột
    SENTENCE_ORDER = 'sentence_order',// Sắp xếp câu
    PARAGRAPH_ORDER = 'paragraph_order',// Sắp xếp đoạn
    TABLE = 'table',                  // Bảng/biểu đồ/Graph
    DICTATION = 'dictation',          // Nghe – chép lại
    TRANSLATION = 'translation',      // Dịch (HSK/TOEFL)
}

export enum ExamAttemptStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned', // quên làm
    NOT_STARTED = 'not_started',
}

export enum SpeakingTopic {
    ACADEMIC_TOPICS = 'Academic Topics',
    CULTURE = 'Culture',
    DAILY_LIFE = 'Daily Life',
    EDUCATION = 'Education',
    ENVIRONMENT = 'Environment',
    HEALTH = 'Health',
    HOBBIES_AND_INTERESTS = 'Hobbies and Interests',
    SOCIAL_ISSUES = 'Social Issues',
    TECHNOLOGY = 'Technology',
    TRAVEL = 'Travel',
    WORK_AND_CAREER = 'Work and Career',
}

export enum RegistrationStatus {
    REGISTERED = 'REGISTERED',
    ATTENDED = 'ATTENDED',
    ABSENT = 'ABSENT',
}

export enum LevelExam {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard',
}

export enum TypeLanguage {
    ENGLISH = 'English',
    CHINESE = 'Chinese',
}