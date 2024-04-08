import { MBTIValue } from './enums'
import { stringEnumToArray } from '~/utils/commons'

export const COMMON_MESSAGES = {
    INVALID_POST_ID: 'ID post không hợp lệ',
    POST_NOT_FOUND: 'Không tìm thấy post',
    DATING_PROFILE_NOT_FOUND: 'Không tìm thấy hồ sơ hẹn hò'
}

export const USERS_MESSAGES = {
    VALIDATION_ERROR: 'Bạn cung cấp dữ liệu chưa hợp lệ',
    NAME_IS_REQUIRED: 'Tên không được để trống',
    NAME_MUST_BE_A_STRING: 'Tên phải là một chuỗi',
    NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Tên phải có độ dài từ 1 đến 100 ký tự',
    EMAIL_IS_REQUIRED: 'Email không được để trống',
    EMAIL_IS_INVALID: 'Email không hợp lệ',
    EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
    YOU_HAVE_NOT_REGISTERED_WITH_THIS_EMAIL: 'Bạn chưa đăng ký tài khoản với email này',
    PASSWORD_IS_REQUIRED: 'Mật khẩu không được để trống',
    PASSWORD_MUST_BE_A_STRING: 'Mật khẩu phải là một chuỗi',
    PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Mật khẩu phải có độ dài từ 6 đến 50 ký tự',
    PASSWORD_MUST_BE_STRONG:
        'Mật khẩu phải có độ dài từ 6 đến 50 ký tự và chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
    CONFIRM_PASSWORD_IS_REQUIRED: 'Xác nhận mật khẩu không được để trống',
    CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Xác nhận mật khẩu phải là một chuỗi',
    CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự',
    CONFIRM_PASSWORD_MUST_BE_STRONG:
        'Xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự và chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
    CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Xác nhận mật khẩu phải trùng khớp với mật khẩu',
    DATE_OF_BIRTH_IS_REQUIRED: 'Ngày sinh không được để trống',
    DATE_OF_BIRTH_MUST_BE_ISO8601: 'Ngày sinh phải là ISO8601',
    SEX_IS_INVALID: 'Giới tính không hợp lệ',
    PHONE_NUMBER_IS_REQUIRED: 'Số điện thoại không được để trống',
    PHONE_NUMBER_IS_INVALID: 'Số điện thoại không hợp lệ',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    INCORRECT_PASSWORD: 'Mật khẩu không chính xác',
    ACCESS_TOKEN_IS_REQUIRED: 'Access token không được để trống',
    REFRESH_TOKEN_IS_REQUIRED: 'Refresh token không được để trống',
    USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Refresh token đã được sử dụng hoặc không tồn tại',
    EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token không được để trống',
    FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token không được để trống',
    INVALID_FORGOT_PASSWORD_TOKEN: 'Forgot password token không hợp lệ',
    USER_NOT_VERIFIED: 'Người dùng chưa được xác thực',
    OLD_PASSWORD_NOT_MATCH: 'Mật khẩu cũ không khớp',
    USER_ID_IS_REQUIRED: 'ID người dùng không được để trống',
    USER_ID_IS_INVALID: 'ID người dùng không hợp lệ',
    USER_HAS_SENT_YOU_A_FRIEND_REQUEST: 'Người dùng đã gửi lời mời kết bạn cho bạn',
    USER_IS_ALREADY_FRIEND: 'Người dùng đã là bạn bè',
    USER_HAS_DECLINED_YOUR_FRIEND_REQUEST: 'Người dùng đã từ chối lời mời kết bạn trước đó của bạn',
    FRIEND_STATUS_IS_INVALID: 'Trạng thái bạn bè không hợp lệ',
    USER_HAS_NOT_SENT_YOU_A_FRIEND_REQUEST: 'Người dùng chưa gửi lời mời kết bạn cho bạn',
    USER_NOT_ADMIN: 'Người dùng không phải là admin',
    SEARCH_MUST_BE_A_STRING: 'Từ khóa tìm kiếm (search) phải là một chuỗi',

    REGISTER_SUCCESS: 'Đăng ký thành công',
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    EMAIL_ALREADY_VERIFIED_BEFORE: 'Email đã được xác thực trước đó',
    EMAIL_VERIFY_SUCCESS: 'Xác thực email thành công',
    RESEND_VERIFY_EMAIL_SUCCESS: 'Gửi lại email xác thực thành công',
    CHECK_EMAIL_TO_RESET_PASSWORD: 'Vui lòng kiểm tra email để đặt lại mật khẩu',
    VERIFY_FORGOT_PASSWORD_SUCCESS: 'Xác thực token đặt lại mật khẩu thành công',
    RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công',
    REFRESH_TOKEN_SUCCESS: 'Refresh token thành công',
    GET_ME_SUCCESS: 'Lấy thông tin người dùng thành công',
    GET_FRIENDS_SUCCESS: 'Lấy tất cả bạn bè thành công',
    GET_PROFILE_SUCCESS: 'Lấy thông tin người dùng thành công',
    GET_ALL_USERS_SUCCESS: 'Lấy tất cả người dùng thành công',
    UPDATE_AVATAR_SUCCESS: 'Cập nhật ảnh đại diện thành công',
    UPDATE_ME_SUCCESS: 'Cập nhật thông tin người dùng thành công',
    CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công',
    GET_ALL_FRIEND_REQUESTS_SUCCESS: 'Lấy tất cả lời mời kết bạn thành công',
    GET_ALL_FRIEND_SUGGESTIONS_SUCCESS: 'Lấy tất cả gợi ý kết bạn thành công',
    SEND_FRIEND_REQUEST_SUCCESS: 'Gửi lời mời kết bạn thành công',
    RESPONSE_FRIEND_REQUEST_SUCCESS: 'Phản hồi lời mời kết bạn thành công',
    CANCEL_FRIEND_REQUEST_SUCCESS: 'Hủy lời mời kết bạn thành công'
}

export const MEDIAS_MESSAGES = {
    INVALID_FILE_TYPE: 'Loại file không hợp lệ',
    NO_IMAGE_PROVIDED: 'Không có ảnh nào được cung cấp',
    NO_VIDEO_PROVIDED: 'Không có video nào được cung cấp',
    IMAGE_NOT_FOUND: 'Không tìm thấy ảnh',
    VIDEO_NOT_FOUND: 'Không tìm thấy video',

    UPLOAD_IMAGE_SUCCESS: 'Tải ảnh lên thành công',
    UPLOAD_VIDEO_HLS_SUCCESS: 'Tải video lên thành công',
    GET_VIDEO_STATUS_SUCCESS: 'Lấy trạng thái video thành công'
}

export const POSTS_MESSAGES = {
    INVALID_TYPE: 'Loại post không hợp lệ',
    CONTENT_MUST_NOT_BE_EMPTY: 'Nội dung không được để trống',
    INVALID_PARENT_ID: 'ID post cha không hợp lệ',
    PARENT_POST_NOT_FOUND: 'Không tìm thấy post cha',
    PARENT_POST_NOT_BE_SHARE_POST: 'Post cha không được là post share',
    PARENT_ID_MUST_BE_NULL: 'ID post cha phải là null',
    HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags phải là một mảng các chuỗi',
    MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias phải là một mảng các Media object',
    MEDIAS_MUST_BE_EMPTY: 'Medias phải là mảng rỗng',
    INVALID_PROFILE_ID: 'ID profile không hợp lệ',
    PROFILE_NOT_FOUND: 'Không tìm thấy profile',
    INVALID_POST_ID: 'ID post không hợp lệ',
    POST_NOT_FOUND: 'Không tìm thấy post',
    NOT_HAVE_PERMISSION_TO_DELETE_POST: 'Bạn không có quyền xóa post này',

    CREATE_POST_SUCCESSFULLY: 'Tạo post thành công',
    GET_POST_SUCCESSFULLY: 'Lấy post thành công',
    GET_NEWS_FEED_SUCCESSFULLY: 'Lấy news feed thành công',
    GET_PROFILE_POSTS_SUCCESSFULLY: 'Lấy tất cả post của profile thành công',
    DELETE_POST_SUCCESSFULLY: 'Xóa post thành công'
}

export const NOTIFICATIONS_MESSAGES = {
    INVALID_TAG_VALUE: 'Giá trị tag không hợp lệ',
    INVALID_NOTIFICATION_ID: 'ID thông báo không hợp lệ',
    NOTIFICATION_NOT_FOUND: 'Không tìm thấy thông báo',
    INVALID_IS_READ_VALUE: 'Giá trị is_read không hợp lệ',

    GET_ALL_NOTIFICATIONS_SUCCESSFULLY: 'Lấy tất cả thông báo thành công',
    GET_UNREAD_NOTIFICATIONS_SUCCESSFULLY: 'Lấy tất cả thông báo chưa đọc thành công',
    UPDATE_NOTIFICATION_SUCCESSFULLY: 'Cập nhật thông báo thành công',
    UPDATE_ALL_NOTIFICATIONS_SUCCESSFULLY: 'Cập nhật tất cả thông báo thành công',
    DELETE_NOTIFICATION_SUCCESSFULLY: 'Xóa thông báo thành công'
}

export const COMMENTS_MESSAGES = {
    INVALID_COMMENT_ID: 'ID comment không hợp lệ',
    COMMENT_NOT_FOUND: 'Không tìm thấy comment',
    CONTENT_MUST_BE_A_STRING: 'Nội dung comment phải là một chuỗi',
    MEDIA_MUST_BE_A_MEDIA_OBJECT_OR_NULL: 'Media phải là một Media object hoặc null',

    GET_COMMENTS_OF_POST_SUCCESSFULLY: 'Lấy tất cả comment của post thành công',
    GET_REPLIES_OF_COMMENT_SUCCESSFULLY: 'Lấy tất cả reply của comment thành công',
    UPDATE_COMMENT_SUCCESSFULLY: 'Cập nhật comment thành công',
    DELETE_COMMENT_SUCCESSFULLY: 'Xóa comment thành công'
}

export const LIKES_MESSAGES = {
    LIKE_POST_SUCCESSFULLY: 'Like post thành công',
    UNLIKE_POST_SUCCESSFULLY: 'Unlike post thành công'
}

export const DATING_USERS_MESSAGES = {
    ID_IS_INVALID: 'ID không hợp lệ',
    DATING_PROFILE_NOT_FOUND: 'Không tìm thấy hồ sơ hẹn hò',
    CHECK_ID_IS_INVALID: 'Check ID không hợp lệ',
    NAME_IS_REQUIRED: 'Tên không được để trống',
    NAME_MUST_BE_A_STRING: 'Tên phải là một chuỗi',
    NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Tên phải có độ dài từ 1 đến 100 ký tự',
    SEX_IS_INVALID: 'Giới tính không hợp lệ',
    HOMETOWN_IS_REQUIRED: 'Quê quán không được để trống',
    HOMETOWN_MUST_BE_A_STRING: 'Quê quán phải là một chuỗi',
    HOMETOWN_LENGTH_MUST_BE_FROM_1_TO_100: 'Quê quán phải có độ dài từ 1 đến 100 ký tự',
    LANGUAGE_IS_INVALID: 'Ngôn ngữ không hợp lệ',

    GET_DATING_PROFILE_SUCCESSFULLY: 'Lấy hồ sơ hẹn hò thành công',
    CREATE_DATING_PROFILE_SUCCESSFULLY: 'Tạo hồ sơ hẹn hò thành công',
    UPDATE_DATING_PROFILE_SUCCESSFULLY: 'Cập nhật hồ sơ hẹn hò thành công'
}

export const DATING_CRITERIAS_MESSAGES = {
    SEX_IS_INVALID: 'Giới tính không hợp lệ',
    AGE_RANGE_MUST_BE_AN_ARRAY: 'Khoảng tuổi phải là một mảng',
    AGE_RANGE_MUST_HAVE_2_ELEMENTS: 'Khoảng tuổi phải có 2 phần tử',
    AGE_RANGE_MUST_BE_FROM_18_TO_65: 'Khoảng tuổi phải từ 18 đến 65',
    HEIGHT_RANGE_MUST_BE_AN_ARRAY: 'Khoảng chiều cao phải là một mảng',
    HEIGHT_RANGE_MUST_HAVE_2_ELEMENTS: 'Khoảng chiều cao phải có 2 phần tử',
    HEIGHT_RANGE_MUST_BE_FROM_140_TO_220: 'Khoảng chiều cao phải từ 140 đến 220',
    HOMETOWN_MUST_BE_A_STRING: 'Quê quán phải là một chuỗi',
    HOMETOWN_LENGTH_MUST_BE_FROM_1_TO_100: 'Quê quán phải có độ dài từ 1 đến 100 ký tự',
    LANGUAGE_IS_INVALID: 'Ngôn ngữ không hợp lệ',

    GET_DATING_CRITERIA_SUCCESSFULLY: 'Lấy tiêu chí hẹn hò thành công',
    CREATE_DATING_CRITERIA_SUCCESSFULLY: 'Tạo tiêu chí hẹn hò thành công',
    UPDATE_DATING_CRITERIA_SUCCESSFULLY: 'Cập nhật tiêu chí hẹn hò thành công'
}

export const MBTI_TEST_MESSAGES = {
    INVALID_MBTI_TEST_ID: 'ID bài trắc nghiệm MBTI không hợp lệ',
    MBTI_TEST_NOT_FOUND: 'Không tìm thấy bài trắc nghiệm MBTI',
    QUESTION_ID_INVALID: 'ID câu hỏi không hợp lệ',
    QUESTION_NOT_FOUND: 'Không tìm thấy câu hỏi',
    ANSWER_MUST_BE_STRING: 'Câu trả lời phải là một chuỗi',
    ANSWER_MUST_BE_IN_VALUES: `Answer phải thuộc một trong các giá trị: ${stringEnumToArray(MBTIValue).join(', ')}`,
    ANSWER_INVALID: 'Câu trả lời không hợp lệ',
    ANSWER_NOT_MATCH_DIMENSION: 'Câu trả lời không khớp với chiều của câu hỏi',
    MBTI_TEST_NOT_COMPLETED: 'Bài trắc nghiệm MBTI chưa hoàn thành',

    CREATE_MBTI_TEST_SUCCESS: 'Tạo bài trắc nghiệm MBTI thành công',
    GET_MBTI_TEST_SUCCESS: 'Lấy bài trắc nghiệm MBTI thành công',
    GET_ALL_MBTI_TESTS_SUCCESS: 'Lấy tất cả bài trắc nghiệm MBTI thành công',
    UPDATE_ANSWER_MBTI_TEST_SUCCESS: 'Cập nhật câu trả lời bài trắc nghiệm MBTI thành công',
    COMPLETE_MBTI_TEST_SUCCESS: 'Hoàn thành bài trắc nghiệm MBTI thành công',
    DELETE_MBTI_TEST_SUCCESS: 'Xóa bài trắc nghiệm MBTI thành công'
}

export const CONSTRUCTIVE_RESULTS_MESSAGES = {
    DATING_USER_ID_INVALID: 'ID người dùng hẹn hò không hợp lệ',
    NOT_ALLOWED_TO_CREATE_RESULT: 'Không được phép tạo trò chơi kiến tạo',
    DATING_USER_NOT_FOUND: 'Không tìm thấy người dùng hẹn hò',
    DATING_CALL_ID_INVALID: 'ID cuộc gọi hẹn hò không hợp lệ',
    DATING_CALL_NOT_FOUND: 'Không tìm thấy cuộc gọi hẹn hò',
    NOT_ALLOWED_TO_GET_RESULT: 'Không được phép lấy kết quả',
    INVALID_CONSTRUCTIVE_RESULT_ID: 'ID trò chơi kiến tạo không hợp lệ',
    CONSTRUCTIVE_RESULT_NOT_FOUND: 'Không tìm thấy trò chơi kiến tạo',
    QUESTION_ID_INVALID: 'ID câu hỏi không hợp lệ',
    QUESTION_NOT_FOUND: 'Không tìm thấy câu hỏi',
    ANSWER_MUST_BE_STRING: 'Câu trả lời phải là một chuỗi',
    INVALID_ANSWER_OPTION: 'Câu trả lời không hợp lệ',

    CONSTRUCTIVE_RESULT_CREATED_SUCCESSFULLY: 'Tạo trò chơi kiến tạo thành công',
    GET_CONSTRUCTIVE_RESULT_SUCCESSFULLY: 'Lấy kết quả trò chơi kiến tạo thành công',
    UPDATE_ANSWER_CONSTRUCTIVE_RESULT_SUCCESSFULLY: 'Cập nhật câu trả lời trò chơi kiến tạo thành công'
}

export const DATING_CALL_MESSAGES = {
    DATING_USER_ID_INVALID: 'ID người dùng hẹn hò không hợp lệ',
    NOT_ALLOWED_TO_CREATE_CALL: 'Không được phép tạo cuộc gọi',
    DATING_USER_NOT_FOUND: 'Không tìm thấy người dùng hẹn hò',
    CONSTRUCTIVE_RESULT_ID_INVALID: 'ID kết quả trò chơi kiến tạo không hợp lệ',
    DURATION_IS_INVALID: 'Thời lượng cuộc gọi không hợp lệ',

    DATING_CALL_CREATED_SUCCESSFULLY: 'Tạo cuộc gọi hẹn hò thành công',
    GET_ALL_DATING_CALLS_SUCCESSFULLY: 'Lấy tất cả cuộc gọi hẹn hò thành công'
}
