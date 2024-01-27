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
    Like = 'like',
    Comment = 'comment',
    Share = 'share',
    NewPost = 'new_post'
}

export enum NotificationTag {
    All = 'all',
    Read = 'read',
    Unread = 'unread'
}
