export enum UserRole {
    Admin = 'admin',
    User = 'user'
}

export enum Sex {
    Male = 'male',
    Female = 'female'
}

export enum TokenTypes {
    AccessToken = 'access_token',
    RefreshToken = 'refresh_token'
}

export enum MediaTypes {
    Image = 'image',
    Video = 'video'
}

export enum VideoEncodingStatus {
    Pending = 'pending',
    Processing = 'processing',
    Success = 'success',
    Failed = 'failed'
}

export enum PostType {
    Post = 'post',
    Share = 'share'
}

export enum NotificationType {
    Post = 'post',
    Friend = 'friend'
}

export enum NotificationPostAction {
    LikePost = 'like_post',
    CommentPost = 'comment_post',
    SharePost = 'share_post',
    HandlePostSuccess = 'handle_post_success'
}

export enum NotificationFriendAction {
    SendFriendRequest = 'send_friend_request',
    AcceptFriendRequest = 'accept_friend_request'
}

export enum NotificationTag {
    All = 'all',
    Read = 'read',
    Unread = 'unread'
}

export enum FriendStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Declined = 'declined'
}

export enum Language {
    Vietnamese = 'Tiếng Việt',
    English = 'Tiếng Anh',
    Japanese = 'Tiếng Nhật',
    French = 'Tiếng Pháp',
    German = 'Tiếng Đức'
}

export enum MBTIDimension {
    EI = 'E-I',
    SN = 'S-N',
    TF = 'T-F',
    JP = 'J-P'
}

export enum MBTIValue {
    E = 'E',
    I = 'I',
    S = 'S',
    N = 'N',
    T = 'T',
    F = 'F',
    J = 'J',
    P = 'P'
}

export enum MBTIType {
    ESTJ = 'ESTJ',
    ESTP = 'ESTP',
    ESFJ = 'ESFJ',
    ESFP = 'ESFP',
    ENTJ = 'ENTJ',
    ENTP = 'ENTP',
    ENFJ = 'ENFJ',
    ENFP = 'ENFP',
    ISTJ = 'ISTJ',
    ISTP = 'ISTP',
    ISFJ = 'ISFJ',
    ISFP = 'ISFP',
    INTJ = 'INTJ',
    INTP = 'INTP',
    INFJ = 'INFJ',
    INFP = 'INFP'
}

export enum MBTITestStatus {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed'
}
