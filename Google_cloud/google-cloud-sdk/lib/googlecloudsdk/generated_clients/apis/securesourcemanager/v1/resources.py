# -*- coding: utf-8 -*- #
# Copyright 2023 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Resource definitions for Cloud Platform Apis generated from apitools."""

import enum


BASE_URL = 'https://securesourcemanager.googleapis.com/v1/'
DOCS_URL = 'https://cloud.google.com/secure-source-manager'


class Collections(enum.Enum):
  """Collections for all supported apis."""

  PROJECTS = (
      'projects',
      'projects/{projectsId}',
      {},
      ['projectsId'],
      True
  )
  PROJECTS_LOCATIONS = (
      'projects.locations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_INSTANCES = (
      'projects.locations.instances',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/instances/'
              '{instancesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_OPERATIONS = (
      'projects.locations.operations',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/operations/'
              '{operationsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES = (
      'projects.locations.repositories',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES_BRANCHRULES = (
      'projects.locations.repositories.branchRules',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}/branchRules/{branchRulesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES_HOOKS = (
      'projects.locations.repositories.hooks',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}/hooks/{hooksId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES_ISSUES = (
      'projects.locations.repositories.issues',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}/issues/{issuesId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES_ISSUES_ISSUECOMMENTS = (
      'projects.locations.repositories.issues.issueComments',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}/issues/{issuesId}/issueComments/'
              '{issueCommentsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES_PULLREQUESTS = (
      'projects.locations.repositories.pullRequests',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}/pullRequests/{pullRequestsId}',
      },
      ['name'],
      True
  )
  PROJECTS_LOCATIONS_REPOSITORIES_PULLREQUESTS_PULLREQUESTCOMMENTS = (
      'projects.locations.repositories.pullRequests.pullRequestComments',
      '{+name}',
      {
          '':
              'projects/{projectsId}/locations/{locationsId}/repositories/'
              '{repositoriesId}/pullRequests/{pullRequestsId}/'
              'pullRequestComments/{pullRequestCommentsId}',
      },
      ['name'],
      True
  )

  def __init__(self, collection_name, path, flat_paths, params,
               enable_uri_parsing):
    self.collection_name = collection_name
    self.path = path
    self.flat_paths = flat_paths
    self.params = params
    self.enable_uri_parsing = enable_uri_parsing
