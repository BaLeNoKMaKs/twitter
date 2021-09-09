import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Like, Repository } from 'typeorm';

import { Tweet } from '../shared/entities/tweet.entity';
import { TweetsService } from './tweets.service';
import { Mention } from '../shared/entities/mention.entity';
import { Tag } from '../shared/entities/tag.entity';
import { UserRepository } from '../users/users.repository';
import { FileService } from '../file/file.service';
import { CreateTweetDto } from './dto/createTweet.dto';
import { SearchTweetDto } from './dto/searchTweet.dto';

const myTweets = [
    {
        "id": 25,
        "text": "test notifications",
        "createdAt": "2021-09-07T07:13:06.834Z",
        "updatedAt": "2021-09-07T07:13:06.834Z",
        "images": [],
        "mentions": [
            {
                "id": 34,
                "username": "browlStars",
                "email": "max-dev-work@mail.ru",
                "created": "2021-09-07T07:13:06.748Z",
                "updated": "2021-09-07T07:13:06.834Z"
            }
        ],
        "tags": []
    },
    {
        "id": 26,
        "text": "test notifications",
        "createdAt": "2021-09-07T07:19:10.911Z",
        "updatedAt": "2021-09-07T07:19:10.911Z",
        "images": [],
        "mentions": [
            {
                "id": 35,
                "username": "browlStars",
                "email": "max-dev-work@mail.ru",
                "created": "2021-09-07T07:19:10.774Z",
                "updated": "2021-09-07T07:19:10.911Z"
            }
        ],
        "tags": []
    }
]


const tweetsByParamsFind = [{
    id: 9,
    text: 'ahahahah2',
    createdAt: "2021-09-01T12:57:59.316Z",
    updatedAt: "2021-09-01T12:57:59.316Z",
    user:  {
      id: 2,
      fullName: 'Maxim',
      username: 'browlStars1',
      email: 'lololoshka@mail.ru',
      password: '$2b$12$D6clJZmz2sqikxjtirKH0eN3Np89psIjCeAxe8P64AfFkdZDBJ1sK',
      createdAt: "2021-08-31T18:20:36.875Z",
      updatedAt: "2021-08-31T18:20:36.875Z",
      avatar: null
    },
    images: [],
    mentions: [],
    tags: [  {
                    "id": 6,
                    "text": "tag1"
                },
                {
                    "id": 7,
                    "text": "unique1"
                } ]
  }]

const tweetsByParamsResponse = [
    {
        "user": {
            "id": 2,
            "fullName": "Maxim",
            "username": "browlStars1",
            "email": "lololoshka@mail.ru",
            "createdAt": "2021-08-31T18:20:36.875Z",
            "updatedAt": "2021-08-31T18:20:36.875Z",
            "avatar": null
        },
        "tweet": {
            "id": 9,
            "text": "ahahahah2",
            "createdAt": "2021-09-01T12:57:59.316Z",
            "updatedAt": "2021-09-01T12:57:59.316Z",
            "images": [],
            "mentions": [],
            "tags": [
                {
                    "id": 6,
                    "text": "tag1"
                },
                {
                    "id": 7,
                    "text": "unique1"
                }
            ]
        }
    }
]

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockFileService = {
  addImagesToTweet: jest.fn(),
  deleteTweetImages: jest.fn()
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TweetsService', () => {
  let tweetService: TweetsService;
  let fileService: FileService;
  let tagRepository: MockRepository<Tag>;
  let userRepository: MockRepository<UserRepository>;
  let mentionRepository: MockRepository<Mention>;
  let tweetRepository: MockRepository<Tweet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: FileService,
          useValue: mockFileService
        },
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(Tag),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(Mention),
          useValue: mockRepository
        }
      ],
    }).compile();

    tweetService = module.get<TweetsService>(TweetsService);

    fileService = module.get<FileService>(FileService);

    tagRepository = module.get<MockRepository<Tag>>(
      getRepositoryToken(Tag),
    );
    userRepository = module.get<MockRepository<UserRepository>>(
      getRepositoryToken(UserRepository),
    );
    mentionRepository = module.get<MockRepository<Mention>>(
      getRepositoryToken(Mention),
    );
    tweetRepository = module.get<MockRepository<Tweet>>(
      getRepositoryToken(Tweet),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tweetService).toBeDefined();
  });

  describe('getYourTweets', () => {
    it('should return all the user\'s tweets', async () => {
      tweetRepository.find.mockResolvedValue(myTweets);

      const id = 10
      const result = await tweetService.getYourTweets(id);

      expect(tweetRepository.find).toHaveBeenCalledTimes(1);
      expect(tweetRepository.find).toHaveBeenCalledWith({
        where: {user: {id}, mainTweet: null},
      });
      expect(result).toEqual(myTweets);
    });
  });

  describe('getTweetsByParams', () => {
    it('should return tweets', async () => {
      tweetRepository.find.mockResolvedValue(tweetsByParamsFind);

      const searchTweetDto: SearchTweetDto = {text: "22"}
      const result = await tweetService.getTweetsByParams(searchTweetDto);

      expect(tweetRepository.find).toHaveBeenCalledTimes(1);
      expect(tweetRepository.find).toHaveBeenCalledWith({
            where: {
                text: Like(`%${searchTweetDto.text}%`),
                mainTweet: IsNull(),
            },
            relations: ['user'],
        });
      expect(result).toEqual(tweetsByParamsResponse);
    })
  });

  describe('createTweet', () => {
    const newTweetDto: CreateTweetDto = {"text": "test notifications"};
    const userId = 20;

    it('should create a tweet', async () => {
      userRepository.findOne.mockResolvedValue({
        id: userId,
        fullName: 'Max',
        username: 'wsx',
        email: 'wsx@mail.ru',
        password: '$2b$12$Pi7qhDUT9X6Tu0f48o5xsuIjLUHRcn8qsFZHZasNstgdiak531X/S',
        createdAt: "2021-09-06T07:54:12.582Z",
        updatedAt: "2021-09-06T07:54:12.582Z",
        avatar:  {
          id: 15,
          key: 'gnmvxwlth1lv9wgnf7uh',
          url: 'https://res.cloudinary.com/maxdevtwitter/image/upload/v1630914851/gnmvxwlth1lv9wgnf7uh.jpg',
          created: "2021-09-06T07:54:12.306Z",
          updated: "2021-09-06T07:54:12.306Z"
        }
      });
      tweetRepository.create.mockResolvedValue({
        text: newTweetDto.text,
        user:  {
          id: userId,
          fullName: 'Max',
          username: 'wsx',
          email: 'wsx@mail.ru',
          password: '$2b$12$Pi7qhDUT9X6Tu0f48o5xsuIjLUHRcn8qsFZHZasNstgdiak531X/S',
          createdAt: "2021-09-06T07:54:12.582Z",
          updatedAt: "2021-09-06T07:54:12.582Z",
          avatar:  {
            id: 15,
            key: 'gnmvxwlth1lv9wgnf7uh',
            url: 'https://res.cloudinary.com/maxdevtwitter/image/upload/v1630914851/gnmvxwlth1lv9wgnf7uh.jpg',
            created: "2021-09-06T07:54:12.306Z",
            updated: "2021-09-06T07:54:12.306Z"
          }
        },
        images: [],
        mentions: [],
        tags: [],
        comments: []
      });
      tweetRepository.save.mockResolvedValue({
        text: newTweetDto.text,
        user: {
        id: 20,
        fullName: 'Max',
        username: 'wsx',
        email: 'wsx@mail.ru',
        password: '$2b$12$Pi7qhDUT9X6Tu0f48o5xsuIjLUHRcn8qsFZHZasNstgdiak531X/S',
        createdAt: "2021-09-06T07:54:12.582Z",
        updatedAt: "2021-09-06T07:54:12.582Z",
        avatar:  {
          id: 15,
          key: 'gnmvxwlth1lv9wgnf7uh',
          url: 'https://res.cloudinary.com/maxdevtwitter/image/upload/v1630914851/gnmvxwlth1lv9wgnf7uh.jpg',
          created: "2021-09-06T07:54:12.306Z",
          updated: "2021-09-06T07:54:12.306Z"
        }
      },
      images: [],
      mentions: [],
      tags: [],
      comments: [],
      id: 30,
      createdAt: "2021-09-08T19:00:40.491Z",
      updatedAt: "2021-09-08T19:00:40.491Z",
      });
      
      mentionRepository.save.mockResolvedValue({ username: 'browlStars', email: 'max-dev-work@mail.ru' })

      const result = await tweetService.createTweet(userId, newTweetDto);

      expect(tweetRepository.findOne).toHaveBeenCalledTimes(1);
      expect(tweetRepository.findOne).toHaveBeenCalledWith({
           where: {
              id: userId
           },
       });
      expect(tweetRepository.create).toHaveBeenCalledTimes(1);
      expect(tweetRepository.save).toBeCalledTimes(1);
      expect(result).toEqual({
    user: {
        id: 20,
        fullName: "Max",
        username: "wsx",
        email: "wsx@mail.ru",
        createdAt: "2021-09-06T07:54:12.582Z",
        updatedAt: "2021-09-06T07:54:12.582Z",
        avatar: {
            id: 15,
            key: "gnmvxwlth1lv9wgnf7uh",
            url: "https://res.cloudinary.com/maxdevtwitter/image/upload/v1630914851/gnmvxwlth1lv9wgnf7uh.jpg",
            created: "2021-09-06T07:54:12.306Z",
            updated: "2021-09-06T07:54:12.306Z"
        }
    },
    tweet: {
        text: "test notifications",
        images: [],
        mentions: [],
        tags: [],
        comments: [],
        
    },
    message: "Tweet was created successfully"
})
    });

    it('should return identify user exception', async () => {
      userRepository.findOne.mockResolvedValue(undefined);

      const result = tweetService.createTweet(userId, newTweetDto);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
           where: {
              id: userId
           },
       });
     await expect(result).rejects.toThrow();
    });
  });

});
