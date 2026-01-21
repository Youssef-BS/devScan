export type RepoVisibility = 'public' | 'private' ;

export interface Repo {
    name : string ;
    description : string ;
    language : string ;
    state : RepoVisibility ;
    issues : number ;
    lastScan : string ;
    auto_audit : boolean ;
}